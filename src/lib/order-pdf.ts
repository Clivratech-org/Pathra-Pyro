import { readFile } from "fs/promises";
import { join } from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { SiteSettings } from "@/lib/settings";
import { formatOrderChannel } from "@/lib/utils";

export type OrderPdfItem = {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  qty: number;
};

export type OrderPdfData = {
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  subtotal: number;
  savings: number;
  gstPercent: number;
  gstAmount: number;
  packingCharge: number;
  shippingCharge: number;
  total: number;
  paymentStatus: string;
  channel: string;
  items: OrderPdfItem[];
};

export type OrderWithItems = OrderPdfData;

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 40;
const MAROON = rgb(0.361, 0.059, 0.122);
const GOLD = rgb(0.91, 0.725, 0.302);
const DARK = rgb(0.102, 0.063, 0.086);
const MUTED = rgb(0.38, 0.32, 0.3);
const LINE = rgb(0.82, 0.74, 0.62);
const CREAM = rgb(1, 0.973, 0.918);
const ROW_ALT = rgb(0.992, 0.965, 0.91);

function rs(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function pdfSafe(text: string) {
  return String(text || "")
    .replace(/₹/g, "Rs.")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

async function embedLogo(pdf: PDFDocument) {
  const paths = [
    join(process.cwd(), "src", "assets", "logo.png"),
    join(process.cwd(), "public", "images", "logo.png"),
    join(process.cwd(), "images", "logo.png"),
  ];
  for (const file of paths) {
    try {
      return await pdf.embedPng(await readFile(file));
    } catch {
      /* try next */
    }
  }
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/images/logo.png`);
    if (!res.ok) return null;
    return await pdf.embedPng(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = DARK
) {
  page.drawText(pdfSafe(text), { x, y, font, size, color });
}

function drawHeader(
  page: PDFPage,
  opts: {
    logo: PDFImage | null;
    settings: SiteSettings;
    title: string;
    subtitle: string;
    fonts: { bold: PDFFont; regular: PDFFont };
  }
) {
  const { logo, settings, title, subtitle, fonts } = opts;
  page.drawRectangle({ x: 0, y: PAGE.height - 8, width: PAGE.width, height: 8, color: MAROON });
  page.drawRectangle({ x: 0, y: PAGE.height - 118, width: PAGE.width, height: 110, color: CREAM });

  let textX = MARGIN;
  if (logo) {
    const size = 56;
    const scale = Math.min(size / logo.width, size / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;
    page.drawImage(logo, { x: MARGIN, y: PAGE.height - 28 - h, width: w, height: h });
    textX = MARGIN + w + 12;
  }

  drawText(page, settings.businessName, textX, PAGE.height - 48, fonts.bold, 16, MAROON);
  const tag = wrapText(fonts.regular, settings.tagline, 8, 280);
  drawText(page, tag[0] || "", textX, PAGE.height - 62, fonts.regular, 8, MUTED);
  const addr = wrapText(fonts.regular, settings.address, 8, 280);
  drawText(page, addr[0] || "", textX, PAGE.height - 76, fonts.regular, 8, MUTED);
  drawText(
    page,
    `GSTIN ${settings.gstin}  |  License ${settings.license}`,
    textX,
    PAGE.height - 90,
    fonts.regular,
    7.5,
    MUTED
  );

  const titleWidth = fonts.bold.widthOfTextAtSize(title, 14);
  drawText(page, title, PAGE.width - MARGIN - titleWidth, PAGE.height - 48, fonts.bold, 14, MAROON);
  const subWidth = fonts.regular.widthOfTextAtSize(subtitle, 9);
  drawText(page, subtitle, PAGE.width - MARGIN - subWidth, PAGE.height - 64, fonts.regular, 9, MUTED);
  page.drawRectangle({ x: 0, y: PAGE.height - 120, width: PAGE.width, height: 3, color: GOLD });
  return PAGE.height - 140;
}

function drawFooter(page: PDFPage, font: PDFFont, pageNo: number, pages: number, note: string) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: 28, color: MAROON });
  drawText(page, note, MARGIN, 11, font, 7.5, GOLD);
  const label = `Page ${pageNo} of ${pages}`;
  drawText(page, label, PAGE.width - MARGIN - font.widthOfTextAtSize(label, 7.5), 11, font, 7.5, GOLD);
}

function newPage(pdf: PDFDocument) {
  return pdf.addPage([PAGE.width, PAGE.height]);
}

type Col = { key: string; label: string; width: number; align?: "left" | "right" | "center" };

function drawTableHeader(page: PDFPage, y: number, cols: Col[], font: PDFFont) {
  const tableWidth = cols.reduce((s, c) => s + c.width, 0);
  page.drawRectangle({ x: MARGIN, y: y - 6, width: tableWidth, height: 20, color: MAROON });
  let x = MARGIN;
  for (const col of cols) {
    const labelX =
      col.align === "right"
        ? x + col.width - 8 - font.widthOfTextAtSize(col.label, 8)
        : col.align === "center"
          ? x + (col.width - font.widthOfTextAtSize(col.label, 8)) / 2
          : x + 6;
    drawText(page, col.label, labelX, y, font, 8, GOLD);
    x += col.width;
  }
  return y - 22;
}

function cellX(col: Col, x: number, text: string, font: PDFFont, size: number) {
  if (col.align === "right") return x + col.width - 8 - font.widthOfTextAtSize(text, size);
  if (col.align === "center") return x + (col.width - font.widthOfTextAtSize(text, size)) / 2;
  return x + 6;
}

async function prepareDoc() {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(pdf);
  return { pdf, regular, bold, logo };
}

export async function buildInvoicePdf(order: OrderWithItems, settings: SiteSettings) {
  const { pdf, regular, bold, logo } = await prepareDoc();
  const items = order.items;
  const cols: Col[] = [
    { key: "no", label: "#", width: 28, align: "center" },
    { key: "name", label: "Product", width: 210 },
    { key: "cat", label: "Category", width: 90 },
    { key: "qty", label: "Qty", width: 40, align: "right" },
    { key: "rate", label: "Rate", width: 72, align: "right" },
    { key: "amt", label: "Amount", width: 75, align: "right" },
  ];
  const tableWidth = cols.reduce((s, c) => s + c.width, 0);

  const pages: PDFPage[] = [];
  let page = newPage(pdf);
  pages.push(page);
  let y = drawHeader(page, {
    logo,
    settings,
    title: "TAX INVOICE",
    subtitle: order.orderNumber,
    fonts: { bold, regular },
  });

  drawText(page, "Bill to", MARGIN, y, bold, 9, MAROON);
  y -= 14;
  drawText(page, order.customerName, MARGIN, y, bold, 11, DARK);
  y -= 13;
  drawText(page, order.customerPhone, MARGIN, y, regular, 9, MUTED);
  y -= 12;
  const addrLines = wrapText(regular, `${order.address}, ${order.pincode}`, 9, 280);
  for (const line of addrLines) {
    drawText(page, line, MARGIN, y, regular, 9, MUTED);
    y -= 12;
  }

  const metaX = 360;
  let my = PAGE.height - 150;
  const meta = [
    ["Invoice no.", order.orderNumber],
    ["Date", order.createdAt.toLocaleDateString("en-IN")],
    ["Payment", order.paymentStatus.toUpperCase()],
    ["Channel", formatOrderChannel(order.channel)],
  ];
  for (const [k, v] of meta) {
    drawText(page, k, metaX, my, regular, 8, MUTED);
    drawText(page, v, metaX + 70, my, bold, 8, DARK);
    my -= 13;
  }
  y = Math.min(y, my) - 10;

  y = drawTableHeader(page, y, cols, bold);

  items.forEach((item, idx) => {
    const nameLines = wrapText(bold, item.name, 8.5, cols[1].width - 12);
    const catLines = wrapText(regular, item.category || "-", 8, cols[2].width - 12);
    const rowH = Math.max(18, Math.max(nameLines.length, catLines.length) * 11 + 8);
    if (y - rowH < 70) {
      page = newPage(pdf);
      pages.push(page);
      y = drawHeader(page, {
        logo,
        settings,
        title: "TAX INVOICE",
        subtitle: `${order.orderNumber} (contd.)`,
        fonts: { bold, regular },
      });
      y = drawTableHeader(page, y, cols, bold);
    }
    if (idx % 2 === 0) {
      page.drawRectangle({ x: MARGIN, y: y - rowH + 12, width: tableWidth, height: rowH, color: ROW_ALT });
    }
    const values: Record<string, string[]> = {
      no: [String(idx + 1)],
      name: nameLines,
      cat: catLines,
      qty: [String(item.qty)],
      rate: [rs(item.salePrice)],
      amt: [rs(item.salePrice * item.qty)],
    };
    let x = MARGIN;
    for (const col of cols) {
      const lines = values[col.key];
      lines.forEach((line, li) => {
        drawText(page, line, cellX(col, x, line, col.key === "name" ? bold : regular, 8.5), y - li * 11, col.key === "name" ? bold : regular, 8.5, DARK);
      });
      x += col.width;
    }
    y -= rowH;
  });

  if (y < 160) {
    page = newPage(pdf);
    pages.push(page);
    y = drawHeader(page, {
      logo,
      settings,
      title: "TAX INVOICE",
      subtitle: `${order.orderNumber} (contd.)`,
      fonts: { bold, regular },
    });
  }

  y -= 8;
  const totals = [
    ["Subtotal", rs(order.subtotal)],
    ...(order.savings > 0 ? [["You saved", rs(order.savings)]] : []),
    ...(order.gstAmount > 0 ? [[`GST (${order.gstPercent}%)`, rs(order.gstAmount)]] : []),
    ...(order.packingCharge > 0 ? [["Packing", rs(order.packingCharge)]] : []),
    ...(order.shippingCharge > 0 ? [["Shipping", rs(order.shippingCharge)]] : []),
  ];
  const boxX = 320;
  const boxW = tableWidth - (boxX - MARGIN);
  const boxH = totals.length * 16 + 36;
  page.drawRectangle({ x: boxX, y: y - boxH, width: boxW, height: boxH, color: CREAM, borderColor: GOLD, borderWidth: 1 });
  let ty = y - 16;
  for (const [label, value] of totals) {
    drawText(page, label, boxX + 10, ty, regular, 9, MUTED);
    drawText(page, value, boxX + boxW - 10 - bold.widthOfTextAtSize(value, 9), ty, bold, 9, DARK);
    ty -= 16;
  }
  page.drawLine({ start: { x: boxX + 8, y: ty + 8 }, end: { x: boxX + boxW - 8, y: ty + 8 }, thickness: 0.8, color: GOLD });
  drawText(page, "Grand Total", boxX + 10, ty - 4, bold, 11, MAROON);
  drawText(
    page,
    rs(order.total),
    boxX + boxW - 10 - bold.widthOfTextAtSize(rs(order.total), 12),
    ty - 4,
    bold,
    12,
    MAROON
  );

  y = y - boxH - 24;
  drawText(page, "Thank you for shopping with Sri Pathra Pyro World.", MARGIN, Math.max(y, 48), regular, 8.5, MUTED);
  drawText(page, "This is a computer-generated invoice.", MARGIN, Math.max(y, 48) - 12, regular, 8, MUTED);

  pages.forEach((p, i) =>
    drawFooter(p, regular, i + 1, pages.length, `${settings.phone}  |  ${settings.email}  |  ${settings.cityLine}`)
  );
  return pdf.save();
}

export async function buildChecklistPdf(order: OrderWithItems, settings: SiteSettings) {
  const { pdf, regular, bold, logo } = await prepareDoc();
  const items = order.items;
  const cols: Col[] = [
    { key: "packed", label: "Packed", width: 48, align: "center" },
    { key: "no", label: "#", width: 28, align: "center" },
    { key: "name", label: "Product", width: 220 },
    { key: "cat", label: "Category", width: 100 },
    { key: "qty", label: "Qty", width: 48, align: "right" },
    { key: "checked", label: "Verified", width: 71, align: "center" },
  ];
  const tableWidth = cols.reduce((s, c) => s + c.width, 0);
  const pages: PDFPage[] = [];
  let page = newPage(pdf);
  pages.push(page);
  let y = drawHeader(page, {
    logo,
    settings,
    title: "PACKING CHECKLIST",
    subtitle: order.orderNumber,
    fonts: { bold, regular },
  });

  drawText(page, `Order ${order.orderNumber}`, MARGIN, y, bold, 11, DARK);
  drawText(page, `Date ${order.createdAt.toLocaleDateString("en-IN")}`, 250, y, regular, 9, MUTED);
  const skuLabel = `${items.length} SKUs  |  ${items.reduce((s, i) => s + i.qty, 0)} units`;
  drawText(page, skuLabel, PAGE.width - MARGIN - regular.widthOfTextAtSize(skuLabel, 9), y, regular, 9, MUTED);
  y -= 16;
  drawText(
    page,
    "Warehouse copy — customer details omitted. Tick Packed while filling, then Verified after a second check.",
    MARGIN,
    y,
    regular,
    8,
    MUTED
  );
  y -= 18;
  y = drawTableHeader(page, y, cols, bold);

  function checkbox(pg: PDFPage, cx: number, cy: number) {
    pg.drawRectangle({
      x: cx - 5.5,
      y: cy - 2,
      width: 11,
      height: 11,
      borderColor: MAROON,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
  }

  items.forEach((item, idx) => {
    const nameLines = wrapText(bold, item.name, 8.5, cols[2].width - 12);
    const catLines = wrapText(regular, item.category || "-", 8, cols[3].width - 12);
    const rowH = Math.max(22, Math.max(nameLines.length, catLines.length) * 11 + 10);
    if (y - rowH < 90) {
      page = newPage(pdf);
      pages.push(page);
      y = drawHeader(page, {
        logo,
        settings,
        title: "PACKING CHECKLIST",
        subtitle: `${order.orderNumber} (contd.)`,
        fonts: { bold, regular },
      });
      y = drawTableHeader(page, y, cols, bold);
    }
    if (idx % 2 === 0) {
      page.drawRectangle({ x: MARGIN, y: y - rowH + 12, width: tableWidth, height: rowH, color: ROW_ALT });
    }
    checkbox(page, MARGIN + cols[0].width / 2, y - 1);
    drawText(page, String(idx + 1), cellX(cols[1], MARGIN + cols[0].width, String(idx + 1), regular, 8.5), y, regular, 8.5, DARK);
    nameLines.forEach((line, li) => {
      drawText(page, line, MARGIN + cols[0].width + cols[1].width + 6, y - li * 11, bold, 8.5, DARK);
    });
    catLines.forEach((line, li) => {
      drawText(
        page,
        line,
        MARGIN + cols[0].width + cols[1].width + cols[2].width + 6,
        y - li * 11,
        regular,
        8,
        MUTED
      );
    });
    const qty = String(item.qty);
    const qtyCol = cols[4];
    const qtyX = MARGIN + cols[0].width + cols[1].width + cols[2].width + cols[3].width;
    drawText(page, qty, cellX(qtyCol, qtyX, qty, bold, 10), y, bold, 10, MAROON);
    checkbox(page, qtyX + qtyCol.width + cols[5].width / 2, y - 1);
    y -= rowH;
  });

  if (y < 130) {
    page = newPage(pdf);
    pages.push(page);
    y = drawHeader(page, {
      logo,
      settings,
      title: "PACKING CHECKLIST",
      subtitle: `${order.orderNumber} (contd.)`,
      fonts: { bold, regular },
    });
  }

  y -= 8;
  page.drawRectangle({
    x: MARGIN,
    y: y - 72,
    width: tableWidth,
    height: 72,
    color: CREAM,
    borderColor: GOLD,
    borderWidth: 1,
  });
  drawText(page, "Packing notes / shortages", MARGIN + 10, y - 16, bold, 9, MAROON);
  page.drawLine({ start: { x: MARGIN + 10, y: y - 32 }, end: { x: MARGIN + tableWidth - 10, y: y - 32 }, thickness: 0.4, color: LINE });
  page.drawLine({ start: { x: MARGIN + 10, y: y - 48 }, end: { x: MARGIN + tableWidth - 10, y: y - 48 }, thickness: 0.4, color: LINE });
  page.drawLine({ start: { x: MARGIN + 10, y: y - 62 }, end: { x: MARGIN + tableWidth - 10, y: y - 62 }, thickness: 0.4, color: LINE });

  y -= 92;
  const signW = (tableWidth - 16) / 3;
  ["Packed by", "Verified by", "Dispatched by"].forEach((label, i) => {
    const sx = MARGIN + i * (signW + 8);
    page.drawRectangle({ x: sx, y: y - 48, width: signW, height: 48, borderColor: LINE, borderWidth: 0.8 });
    drawText(page, label, sx + 8, y - 14, bold, 8, MAROON);
    drawText(page, "Name / Sign / Date", sx + 8, y - 38, regular, 7.5, MUTED);
  });

  pages.forEach((p, i) =>
    drawFooter(p, regular, i + 1, pages.length, `Internal packing checklist  |  ${order.orderNumber}  |  Do not share with customer`)
  );
  return pdf.save();
}

export function pdfFileResponse(bytes: Uint8Array, filename: string) {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
