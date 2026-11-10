"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { MemberCustomPricing } from "@/types";

export function useMemberConfigurations(organizationId: string | null) {
  const [memberPricingMap, setMemberPricingMap] = useState<Map<string, MemberCustomPricing>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchConfigurations = useCallback(async () => {
    if (!organizationId) {
      setMemberPricingMap(new Map());
      return;
    }

    setLoading(true);
    try {
      let rows: Record<string, unknown>[] | null = null;

      const { data, error } = await supabase
        .from("MemberConfiguration")
        .select("*");

      if (!error && data) {
        rows = data as Record<string, unknown>[];
      } else {
        const fallback = await supabase
          .from("memberconfiguration")
          .select("*");
        if (!fallback.error && fallback.data) {
          rows = fallback.data as Record<string, unknown>[];
        }
      }

      const newMap = new Map<string, MemberCustomPricing>();

      if (rows && rows.length > 0) {
        for (const row of rows) {
          const settingName = String(
            row.SettingName ?? row.settingname ?? row.setting_name ?? ""
          ).trim();

          const isPaymentSetting =
            settingName === "PlaymentSetting" ||
            settingName === "PaymentSetting" ||
            settingName.toLowerCase() === "playmentsetting" ||
            settingName.toLowerCase() === "paymentsetting";

          if (isPaymentSetting) {
            const memberId = String(
              row.MemberId ?? row.memberid ?? row.member_id ?? ""
            ).trim();

            if (memberId) {
              const rawValue = row.value ?? row.Value;
              const parsedObj: Record<string, unknown> =
                typeof rawValue === "string"
                  ? JSON.parse(rawValue)
                  : (rawValue as Record<string, unknown>) || {};

              const cordoba = Number(
                parsedObj.AmountMonthCordoba ??
                  parsedObj.amountMonthCordoba ??
                  parsedObj.AmountMonth ??
                  parsedObj.amountMonth
              );
              const dollar = Number(
                parsedObj.AmountMonthDollar ??
                  parsedObj.amountMonthDollar
              );

              newMap.set(memberId, {
                AmountMonthCordoba: !isNaN(cordoba) && cordoba > 0 ? cordoba : undefined,
                AmountMonthDollar: !isNaN(dollar) && dollar > 0 ? dollar : undefined,
              });
            }
          }
        }
      }

      setMemberPricingMap(newMap);
    } catch (err) {
      console.warn("Error al cargar configuraciones de miembros:", err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const saveMemberPricing = useCallback(
    async (memberId: string, pricing: MemberCustomPricing): Promise<boolean> => {
      setSaving(true);
      try {
        const cleanPayload: Record<string, number> = {};
        if (pricing.AmountMonthCordoba && pricing.AmountMonthCordoba > 0) {
          cleanPayload.AmountMonthCordoba = pricing.AmountMonthCordoba;
        }
        if (pricing.AmountMonthDollar && pricing.AmountMonthDollar > 0) {
          cleanPayload.AmountMonthDollar = pricing.AmountMonthDollar;
        }

        const upsertPayload = {
          MemberId: memberId,
          SettingName: "PlaymentSetting",
          value: cleanPayload,
          updated_at: new Date().toISOString(),
        };

        let res = await supabase
          .from("MemberConfiguration")
          .upsert(upsertPayload, { onConflict: "MemberId,SettingName" });

        if (res.error) {
          res = await supabase
            .from("memberconfiguration")
            .upsert(
              {
                member_id: memberId,
                setting_name: "PlaymentSetting",
                value: cleanPayload,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "member_id,setting_name" }
            );
        }

        if (res.error) throw res.error;

        setMemberPricingMap((prev) => {
          const next = new Map(prev);
          next.set(memberId, pricing);
          return next;
        });

        return true;
      } catch (err) {
        console.error("Error al guardar tarifa de miembro:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [supabase]
  );

  const removeMemberPricing = useCallback(
    async (memberId: string): Promise<boolean> => {
      setSaving(true);
      try {
        let res = await supabase
          .from("MemberConfiguration")
          .delete()
          .eq("MemberId", memberId)
          .eq("SettingName", "PlaymentSetting");

        if (res.error) {
          res = await supabase
            .from("memberconfiguration")
            .delete()
            .eq("member_id", memberId)
            .eq("setting_name", "PlaymentSetting");
        }

        if (res.error) throw res.error;

        setMemberPricingMap((prev) => {
          const next = new Map(prev);
          next.delete(memberId);
          return next;
        });

        return true;
      } catch (err) {
        console.error("Error al remover tarifa personalizada:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [supabase]
  );

  const getMemberPricing = useCallback(
    (memberId: string | null | undefined): MemberCustomPricing | null => {
      if (!memberId) return null;
      return memberPricingMap.get(memberId) || null;
    },
    [memberPricingMap]
  );

  return {
    memberPricingMap,
    loading,
    saving,
    getMemberPricing,
    saveMemberPricing,
    removeMemberPricing,
    refreshMemberConfigurations: fetchConfigurations,
  };
}

