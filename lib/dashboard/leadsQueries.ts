import { isLeadOverdue } from "@/lib/dashboard/leadSla";
import { leadStatusLabels } from "@/lib/dashboard/constants";
import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/types/database";

const SEARCH_MAX_LENGTH = 80;

export type LeadsListFilters = {
  status?: string;
  q?: string;
  overdue?: string;
};

export type LeadsListResult = {
  leads: Lead[];
  adminNameById: Map<string, string>;
  totalCount: number;
  filters: LeadsListFilters;
};

function sanitizeSearchQuery(value: string | undefined) {
  const trimmed = (value ?? "").trim().slice(0, SEARCH_MAX_LENGTH);
  return trimmed.length >= 2 ? trimmed : "";
}

export async function fetchLeadsList(filters: LeadsListFilters): Promise<LeadsListResult> {
  const supabase = await createClient();
  const statusFilter = filters.status && filters.status in leadStatusLabels ? (filters.status as LeadStatus) : undefined;
  const searchQuery = sanitizeSearchQuery(filters.q);
  const overdueOnly = filters.overdue === "1";

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    const pattern = `%${searchQuery.replace(/[%_]/g, "")}%`;
    query = query.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
  }

  const { data: leadsRaw } = await query;
  let leads = (leadsRaw ?? []) as Lead[];

  if (overdueOnly) {
    leads = leads.filter(isLeadOverdue);
  }

  const adminIds = [...new Set(leads.map((lead) => lead.assigned_admin_id).filter(Boolean))] as string[];
  const adminNameById = new Map<string, string>();

  if (adminIds.length) {
    const { data: admins } = await supabase.from("profiles").select("id, full_name").in("id", adminIds);
    for (const admin of admins ?? []) {
      adminNameById.set(admin.id, admin.full_name ?? "Admin");
    }
  }

  return {
    leads,
    adminNameById,
    totalCount: leads.length,
    filters,
  };
}
