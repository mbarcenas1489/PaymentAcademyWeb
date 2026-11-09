"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { PaymentSummary, PaymentDraft, InstallmentInput } from "@/types";
import { formatCurrency, getPaymentMethodLabel } from "@/utils/formatters";

export function usePayments(
  organizationId: string | null,
  options?: {
    initialFromDate?: string;
    initialToDate?: string;
    memberId?: string | null;
  }
) {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState<string>(options?.initialFromDate || "");
  const [toDate, setToDate] = useState<string>(options?.initialToDate || "");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    options?.memberId || null
  );

  const supabase = createClient();

  const fetchPayments = useCallback(async () => {
    if (!organizationId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("payments")
        .select(`
          *,
          members (
            full_name,
            document_number
          )
        `)
        .eq("organization_id", organizationId)
        .order("paid_on", { ascending: false })
        .order("created_at", { ascending: false });

      if (fromDate) {
        query = query.gte("paid_on", fromDate);
      }
      if (toDate) {
        query = query.lte("paid_on", toDate);
      }
      if (selectedMemberId) {
        query = query.eq("member_id", selectedMemberId);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const formatted: PaymentSummary[] = (data || []).map((p: any) => ({
        id: p.id,
        organization_id: p.organization_id,
        member_id: p.member_id,
        amount: Number(p.amount) || 0,
        pending_amount: Number(p.pending_amount) || 0,
        currency: p.currency === "USD" ? "USD" : "NIO",
        paid_on: p.paid_on,
        payment_type: p.payment_type,
        payment_method: p.payment_method,
        valid_from: p.valid_from,
        valid_until: p.valid_until,
        reference: p.reference,
        notes: p.notes,
        created_at: p.created_at,
        memberName: p.members?.full_name || "Desconocido",
        memberDocument: p.members?.document_number || null,
      }));

      setPayments(formatted);
    } catch (err: any) {
      setError(err?.message || "Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  }, [organizationId, fromDate, toDate, selectedMemberId, supabase]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const checkValidityOverlap = useCallback(
    async (
      memberId: string,
      validFrom: string,
      validUntil: string,
      excludedPaymentId?: string | null
    ): Promise<boolean> => {
      if (!organizationId) return false;

      let query = supabase
        .from("payments")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("member_id", memberId)
        .lte("valid_from", validUntil)
        .gte("valid_until", validFrom);

      if (excludedPaymentId) {
        query = query.neq("id", excludedPaymentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).length > 0;
    },
    [organizationId, supabase]
  );

  const createPayment = useCallback(
    async (draft: PaymentDraft): Promise<string | null> => {
      if (!organizationId) {
        setError("Organización no identificada");
        return null;
      }

      setSaving(true);
      setError(null);
      try {
        const hasOverlap = await checkValidityOverlap(
          draft.memberId,
          draft.validFrom,
          draft.validUntil
        );

        if (hasOverlap) {
          throw new Error(
            "Ya existe un pago para este miembro dentro del período de vigencia seleccionado."
          );
        }

        const paymentCurrency = draft.currency === "USD" ? "USD" : "NIO";
        const pendingAmount = Math.max(0, Number(draft.pendingAmount) || 0);
        const initialAuditNote =
          pendingAmount > 0
            ? `[Abono inicial ${formatCurrency(draft.amount, paymentCurrency)} el ${draft.paidOn}]`
            : null;
        const combinedNotes = [draft.notes?.trim() || null, initialAuditNote]
          .filter(Boolean)
          .join(" · ") || null;

        const newPayment = {
          organization_id: organizationId,
          member_id: draft.memberId,
          amount: draft.amount,
          pending_amount: pendingAmount,
          currency: paymentCurrency,
          paid_on: draft.paidOn,
          payment_type: draft.paymentType,
          payment_method: draft.paymentMethod,
          valid_from: draft.validFrom,
          valid_until: draft.validUntil,
          reference: draft.reference?.trim() || null,
          notes: combinedNotes,
        };

        const { data, error: insertError } = await supabase
          .from("payments")
          .insert(newPayment)
          .select("id")
          .single();

        if (insertError) throw insertError;

        await fetchPayments();
        return data.id;
      } catch (err: any) {
        setError(err?.message || "Error al guardar el pago");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, fetchPayments, checkValidityOverlap, supabase]
  );

  const updatePayment = useCallback(
    async (paymentId: string, draft: PaymentDraft): Promise<boolean> => {
      if (!organizationId) {
        setError("Organización no identificada");
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const hasOverlap = await checkValidityOverlap(
          draft.memberId,
          draft.validFrom,
          draft.validUntil,
          paymentId
        );

        if (hasOverlap) {
          throw new Error(
            "Ya existe un pago para este miembro dentro del período de vigencia seleccionado."
          );
        }

        const updatedData = {
          member_id: draft.memberId,
          amount: draft.amount,
          pending_amount: Math.max(0, Number(draft.pendingAmount) || 0),
          currency: draft.currency === "USD" ? "USD" : "NIO",
          paid_on: draft.paidOn,
          payment_type: draft.paymentType,
          payment_method: draft.paymentMethod,
          valid_from: draft.validFrom,
          valid_until: draft.validUntil,
          reference: draft.reference?.trim() || null,
          notes: draft.notes?.trim() || null,
        };

        const { error: updateError } = await supabase
          .from("payments")
          .update(updatedData)
          .eq("id", paymentId)
          .eq("organization_id", organizationId);

        if (updateError) throw updateError;

        await fetchPayments();
        return true;
      } catch (err: any) {
        setError(err?.message || "Error al actualizar el pago");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, fetchPayments, checkValidityOverlap, supabase]
  );

  const registerInstallment = useCallback(
    async (
      payment: PaymentSummary,
      input: InstallmentInput
    ): Promise<PaymentSummary | null> => {
      if (!organizationId) {
        setError("Organización no identificada");
        return null;
      }

      if (input.installmentAmount <= 0) {
        setError("El valor del abono debe ser mayor que cero.");
        return null;
      }

      if (input.installmentAmount > payment.pending_amount) {
        setError("El abono no puede superar el saldo pendiente.");
        return null;
      }

      setSaving(true);
      setError(null);
      try {
        const newAmount = payment.amount + input.installmentAmount;
        const newPendingAmount = Math.max(
          0,
          payment.pending_amount - input.installmentAmount
        );

        const installmentLog = `[Abono ${formatCurrency(
          input.installmentAmount,
          payment.currency
        )} el ${input.paidOn} (${getPaymentMethodLabel(input.paymentMethod)})${
          input.notes?.trim() ? `: ${input.notes.trim()}` : ""
        }]`;

        const updatedNotes = [payment.notes, installmentLog]
          .filter(Boolean)
          .join(" · ");

        const updatedReference =
          input.reference?.trim() || payment.reference || null;

        const { error: updateError } = await supabase
          .from("payments")
          .update({
            amount: newAmount,
            pending_amount: newPendingAmount,
            paid_on: input.paidOn,
            payment_method: input.paymentMethod,
            reference: updatedReference,
            notes: updatedNotes,
          })
          .eq("id", payment.id)
          .eq("organization_id", organizationId);

        if (updateError) throw updateError;

        await fetchPayments();

        return {
          ...payment,
          amount: newAmount,
          pending_amount: newPendingAmount,
          paid_on: input.paidOn,
          payment_method: input.paymentMethod,
          reference: updatedReference,
          notes: updatedNotes,
        };
      } catch (err: any) {
        setError(err?.message || "Error al registrar el abono");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, fetchPayments, supabase]
  );

  const deletePayment = useCallback(
    async (paymentId: string): Promise<boolean> => {
      if (!organizationId) {
        setError("Organización no identificada");
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from("payments")
          .delete()
          .eq("id", paymentId)
          .eq("organization_id", organizationId);

        if (deleteError) throw deleteError;

        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
        return true;
      } catch (err: any) {
        setError(err?.message || "Error al eliminar el pago");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, supabase]
  );

  // Compute monthly totals for current calendar month separated by currency
  const [monthlyTotalNIO, setMonthlyTotalNIO] = useState<number>(0);
  const [monthlyTotalUSD, setMonthlyTotalUSD] = useState<number>(0);

  const fetchMonthTotal = useCallback(async () => {
    if (!organizationId) return;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const monthStart = `${year}-${month}-01`;
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      const monthEnd = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("payments")
        .select("amount, currency")
        .eq("organization_id", organizationId)
        .gte("paid_on", monthStart)
        .lte("paid_on", monthEnd);

      if (error) throw error;

      let totalNIO = 0;
      let totalUSD = 0;
      for (const item of data || []) {
        const amt = Number((item as any).amount) || 0;
        const curr = (item as any).currency;
        if (curr === "USD") {
          totalUSD += amt;
        } else {
          totalNIO += amt;
        }
      }
      setMonthlyTotalNIO(totalNIO);
      setMonthlyTotalUSD(totalUSD);
    } catch {
      // silent
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchMonthTotal();
  }, [fetchMonthTotal, payments]);

  return {
    payments,
    loading,
    saving,
    error,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    selectedMemberId,
    setSelectedMemberId,
    monthlyTotal: monthlyTotalNIO,
    monthlyTotalNIO,
    monthlyTotalUSD,
    createPayment,
    updatePayment,
    registerInstallment,
    deletePayment,
    refreshPayments: () => {
      fetchPayments();
      fetchMonthTotal();
    },
    clearError: () => setError(null),
  };
}
