"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { PaymentSettingValue } from "@/types";

const DEFAULT_PAYMENT_SETTING: PaymentSettingValue = {
  AmountMonth: 20,
  AmountBiweek: 10,
  AmountDay: 3,
};

export function useAppConfiguration() {
  const [paymentSetting, setPaymentSetting] = useState<PaymentSettingValue>(
    DEFAULT_PAYMENT_SETTING
  );
  const [loading, setLoading] = useState<boolean>(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      // Try exact table name "AppConfiguration" first, fallback to lowercase "appconfiguration" if needed
      let rows: Record<string, unknown>[] | null = null;

      const { data, error } = await supabase
        .from("AppConfiguration")
        .select("*");

      if (!error && data) {
        rows = data as Record<string, unknown>[];
      } else {
        const fallback = await supabase
          .from("appconfiguration")
          .select("*");
        if (!fallback.error && fallback.data) {
          rows = fallback.data as Record<string, unknown>[];
        }
      }

      if (rows && rows.length > 0) {
        const targetRow = rows.find((r) => {
          const name = String(
            r.SettingName ?? r.settingname ?? r.setting_name ?? ""
          ).trim();
          return (
            name === "PlaymentSetting" ||
            name === "PaymentSetting" ||
            name.toLowerCase() === "playmentsetting" ||
            name.toLowerCase() === "paymentsetting"
          );
        });

        if (targetRow) {
          const rawValue = targetRow.value ?? targetRow.Value;
          const parsedObj: Record<string, unknown> =
            typeof rawValue === "string"
              ? JSON.parse(rawValue)
              : (rawValue as Record<string, unknown>) || {};

          const amountMonth = Number(
            parsedObj.AmountMonth ?? parsedObj.amountMonth ?? DEFAULT_PAYMENT_SETTING.AmountMonth
          );
          const amountBiweek = Number(
            parsedObj.AmountBiweek ?? parsedObj.amountBiweek ?? DEFAULT_PAYMENT_SETTING.AmountBiweek
          );
          const amountDay = Number(
            parsedObj.AmountDay ?? parsedObj.amountDay ?? DEFAULT_PAYMENT_SETTING.AmountDay
          );

          setPaymentSetting({
            AmountMonth:
              !isNaN(amountMonth) && amountMonth > 0
                ? amountMonth
                : DEFAULT_PAYMENT_SETTING.AmountMonth,
            AmountBiweek:
              !isNaN(amountBiweek) && amountBiweek > 0
                ? amountBiweek
                : DEFAULT_PAYMENT_SETTING.AmountBiweek,
            AmountDay:
              !isNaN(amountDay) && amountDay > 0
                ? amountDay
                : DEFAULT_PAYMENT_SETTING.AmountDay,
          });
        }
      }
    } catch (err) {
      console.warn("Usando configuración de pagos por defecto:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  return {
    paymentSetting,
    loading,
    refreshConfiguration: fetchConfiguration,
  };
}

