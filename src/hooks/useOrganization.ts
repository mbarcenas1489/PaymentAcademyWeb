"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrganizationMembership, OrganizationRoleType } from "@/types";
import { User } from "@supabase/supabase-js";

export function useOrganization(user: User | null) {
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMembership = useCallback(async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      if (data && data.length > 0) {
        setMembership({
          organization_id: data[0].organization_id,
          role: (data[0].role?.toLowerCase() as OrganizationRoleType) || "staff",
        });
      } else {
        setError("Tu usuario no está asociado a una academia o gimnasio.");
      }
    } catch (err: any) {
      setError(err?.message || "Error al obtener la organización");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const role = membership?.role || "staff";
  const canManagePayments = role === "owner" || role === "admin";

  return {
    organizationId: membership?.organization_id ?? null,
    role,
    canManagePayments,
    loading,
    error,
    refreshOrganization: fetchMembership,
  };
}

