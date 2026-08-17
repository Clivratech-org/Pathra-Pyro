import { saveLead } from "@/app/admin/actions";

type Lead = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  source: string;
  status: string;
  notes: string;
};

export function LeadStatusForm({ lead }: { lead: Lead }) {
  return (
    <form
      className="lead-status-form"
      action={async (fd) => {
        "use server";
        await saveLead(fd);
      }}
    >
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="name" value={lead.name} />
      <input type="hidden" name="phone" value={lead.phone} />
      <input type="hidden" name="interest" value={lead.interest} />
      <input type="hidden" name="source" value={lead.source} />
      <input type="hidden" name="notes" value={lead.notes} />
      <label className="sr-only" htmlFor={`status-${lead.id}`}>
        Status
      </label>
      <select id={`status-${lead.id}`} name="status" defaultValue={lead.status} className="admin-select">
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="converted">Converted</option>
        <option value="lost">Lost</option>
      </select>
      <button className="btn btn-sm btn-outline" type="submit">
        Update
      </button>
    </form>
  );
}
