"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Member, NewMemberInput, UpdateMemberInput } from "@/types";

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
      const activeMembers = (data || []).filter(
        (m: any) => m.IsDelete !== true && m.isdelete !== true
      );
      setMembers(activeMembers);
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
          IsDelete: false,
        };

        const { data, error: insertError } = await supabase
          .from("members")
          .insert(newRecord)
          .select()
          .single();

        if (insertError) throw insertError;

        if (
          input.customPricing &&
          ((input.customPricing.AmountMonthCordoba && input.customPricing.AmountMonthCordoba > 0) ||
            (input.customPricing.AmountMonthDollar && input.customPricing.AmountMonthDollar > 0))
        ) {
          const cleanPricing: Record<string, number> = {};
          if (input.customPricing.AmountMonthCordoba) {
            cleanPricing.AmountMonthCordoba = input.customPricing.AmountMonthCordoba;
          }
          if (input.customPricing.AmountMonthDollar) {
            cleanPricing.AmountMonthDollar = input.customPricing.AmountMonthDollar;
          }

          const cfgRes = await supabase.from("MemberConfiguration").insert({
            MemberId: data.id,
            SettingName: "PlaymentSetting",
            value: cleanPricing,
          });

          if (cfgRes.error) {
            await supabase.from("memberconfiguration").insert({
              member_id: data.id,
              setting_name: "PlaymentSetting",
              value: cleanPricing,
            });
          }
        }

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

  const updateMember = useCallback(
    async (memberId: string, input: UpdateMemberInput): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const updateData = {
          full_name: input.fullName.trim(),
          document_number: input.documentNumber?.trim() || null,
          email: input.email?.trim() || null,
          phone: input.phone?.trim() || null,
          status: input.status || "active",
          notes: input.notes?.trim() || null,
          updated_at: new Date().toISOString(),
        };

        const { data, error: updateError } = await supabase
          .from("members")
          .update(updateData)
          .eq("id", memberId)
          .select()
          .single();

        if (updateError) throw updateError;

        setMembers((prev) =>
          prev
            .map((m) => (m.id === memberId ? (data as Member) : m))
            .sort((a, b) => a.full_name.localeCompare(b.full_name))
        );
        return true;
      } catch (err: any) {
        setError(err?.message || "Error al actualizar el miembro");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [supabase]
  );

  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        // 1. Soft delete the member
        let memberUpdateRes = await supabase
          .from("members")
          .update({
            IsDelete: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", memberId);

        if (memberUpdateRes.error) {
          memberUpdateRes = await supabase
            .from("members")
            .update({
              isdelete: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", memberId);
        }

        if (memberUpdateRes.error) throw memberUpdateRes.error;

        // 2. Also soft delete the member's payments
        let payUpdateRes = await supabase
          .from("payments")
          .update({ IsDelete: true })
          .eq("member_id", memberId);

        if (payUpdateRes.error) {
          payUpdateRes = await supabase
            .from("payments")
            .update({ isdelete: true })
            .eq("member_id", memberId);
        }

        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        return true;
      } catch (err: any) {
        setError(err?.message || "Error al eliminar el miembro");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [supabase]
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
    updateMember,
    deleteMember,
    refreshMembers: fetchMembers,
    clearError: () => setError(null),
  };
}

