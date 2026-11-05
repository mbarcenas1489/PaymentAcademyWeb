"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Member, NewMemberInput } from "@/types";

export function useMembers(organizationId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    if (!organizationId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from("members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("full_name", { ascending: true });

      if (queryError) throw queryError;
      setMembers(data || []);
    } catch (err: any) {
      setError(err?.message || "Error al cargar los miembros");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = useCallback(
    async (input: NewMemberInput): Promise<Member | null> => {
      if (!organizationId) {
        setError("Organización no identificada");
        return null;
      }

      setSaving(true);
      setError(null);
      try {
        const today = new Date().toISOString().split("T")[0];
        const newRecord = {
          organization_id: organizationId,
          full_name: input.fullName.trim(),
          document_number: input.documentNumber?.trim() || null,
          email: input.email?.trim() || null,
          phone: input.phone?.trim() || null,
          status: "active",
          joined_on: today,
          notes: input.notes?.trim() || null,
        };

        const { data, error: insertError } = await supabase
          .from("members")
          .insert(newRecord)
          .select()
          .single();

        if (insertError) throw insertError;

        setMembers((prev) => [...prev, data].sort((a, b) => a.full_name.localeCompare(b.full_name)));
        return data;
      } catch (err: any) {
        setError(err?.message || "Error al registrar el miembro");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, supabase]
  );

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter((m) => {
      return (
        m.full_name?.toLowerCase().includes(query) ||
        m.document_number?.toLowerCase().includes(query) ||
        m.phone?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query)
      );
    });
  }, [members, searchQuery]);

  return {
    members,
    filteredMembers,
    searchQuery,
    setSearchQuery,
    loading,
    saving,
    error,
    createMember,
    refreshMembers: fetchMembers,
    clearError: () => setError(null),
  };
}

