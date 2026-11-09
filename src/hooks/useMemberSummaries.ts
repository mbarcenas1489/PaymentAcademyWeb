"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { MemberPaymentSummary } from "@/types";

export function useMemberSummaries(organizationId: string | null) {
  const [summaries, setSummaries] = useState<MemberPaymentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const supabase = createClient();

  const fetchSummaries = useCallback(async () => {
    if (!organizationId) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch all members of the organization
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("full_name", { ascending: true });

      if (membersError) throw membersError;

      // Fetch all payments for this org to determine each member's latest payment (by valid_until DESC)
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("organization_id", organizationId)
        .order("valid_until", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Group payments by member_id and pick the latest one
      const latestPaymentByMember = new Map<string, any>();
      for (const p of payments || []) {
        if (!latestPaymentByMember.has(p.member_id)) {
          latestPaymentByMember.set(p.member_id, p);
        }
      }

      const result: MemberPaymentSummary[] = (members || []).map((m: any) => {
        const lastP = latestPaymentByMember.get(m.id);
        return {
          memberId: m.id,
          organizationId: m.organization_id,
          fullName: m.full_name,
          documentNumber: m.document_number,
          email: m.email,
          phone: m.phone,
          memberStatus: m.status,
          lastPaymentId: lastP?.id || null,
          lastAmount: lastP ? Number(lastP.amount) : null,
          lastPendingAmount: lastP ? Number(lastP.pending_amount || 0) : null,
          lastCurrency: lastP ? (lastP.currency === "USD" ? "USD" : "NIO") : null,
          lastPaidOn: lastP?.paid_on || null,
          lastPaymentType: lastP?.payment_type || null,
          lastPaymentMethod: lastP?.payment_method || null,
          lastValidFrom: lastP?.valid_from || null,
          lastValidUntil: lastP?.valid_until || null,
        };
      });

      setSummaries(result);
    } catch (err: any) {
      setError(err?.message || "Error al cargar el resumen de miembros");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const filteredSummaries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return summaries;
    return summaries.filter((s) => {
      return (
        s.fullName?.toLowerCase().includes(query) ||
        s.documentNumber?.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
    });
  }, [summaries, searchQuery]);

  return {
    summaries,
    filteredSummaries,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refreshSummaries: fetchSummaries,
    clearError: () => setError(null),
  };
}

