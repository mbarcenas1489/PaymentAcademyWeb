"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Card,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PaymentsIcon from "@mui/icons-material/Payments";
import {
  InstallmentInput,
  PaymentMethod,
  PaymentSummary,
} from "@/types";
import {
  formatCurrency,
  formatDate,
  getPaymentTypeLabel,
} from "@/utils/formatters";

interface InstallmentDialogProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentSummary | null;
  onSave: (payment: PaymentSummary, input: InstallmentInput) => Promise<boolean>;
  saving: boolean;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "online", label: "Pago en línea" },
  { value: "other", label: "Otro" },
];

export default function InstallmentDialog({
  open,
  onClose,
  payment,
  onSave,
  saving,
}: InstallmentDialogProps) {
  const [installmentAmount, setInstallmentAmount] = useState<string>("");
  const [paidOn, setPaidOn] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !payment) return;
    const today = new Date().toISOString().split("T")[0];
    setInstallmentAmount(String(payment.pending_amount || ""));
    setPaidOn(today);
    setPaymentMethod(payment.payment_method || "cash");
    setReference("");
    setNotes("");
    setError(null);
  }, [open, payment]);

  if (!payment) return null;

  const currentPaid = Number(payment.amount || 0);
  const currentPending = Number(payment.pending_amount || 0);
  const totalPeriodCost = currentPaid + currentPending;

  const parsedInstallment = parseFloat(installmentAmount.replace(/,/g, ".")) || 0;
  const remainingAfterInstallment = Math.max(0, currentPending - parsedInstallment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(parsedInstallment) || parsedInstallment <= 0) {
      setError("Ingresa un valor de abono mayor que cero.");
      return;
    }

    if (parsedInstallment > currentPending) {
      setError(
        `El abono no puede superar el saldo pendiente (${formatCurrency(currentPending)}).`
      );
      return;
    }

    if (!paidOn) {
      setError("Selecciona la fecha en que se realiza el abono.");
      return;
    }

    const ok = await onSave(payment, {
      paymentId: payment.id,
      installmentAmount: parsedInstallment,
      paidOn,
      paymentMethod,
      reference: reference.trim() || null,
      notes: notes.trim() || null,
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentsIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Registrar abono
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Abonar al saldo pendiente del período
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Summary Card of the existing partial payment */}
          <Card
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              backgroundColor: "action.hover",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
              {payment.memberName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              {getPaymentTypeLabel(payment.payment_type)} · Vigencia: {formatDate(payment.valid_from)} al{" "}
              {formatDate(payment.valid_until)}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Valor total del período:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {formatCurrency(totalPeriodCost)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Abonado hasta hoy:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>
                {formatCurrency(currentPaid)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "warning.dark" }}>
                Saldo pendiente actual:
              </Typography>
              <Chip
                label={formatCurrency(currentPending)}
                size="small"
                sx={{
                  fontWeight: 800,
                  backgroundColor: "#FEF3C7",
                  color: "#B45309",
                }}
              />
            </Box>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
              VALOR DEL ABONO
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => setInstallmentAmount(String(currentPending))}
              sx={{ fontSize: "0.75rem", py: 0 }}
            >
              Abonar saldo total ({formatCurrency(currentPending)})
            </Button>
          </Box>

          <TextField
            margin="dense"
            required
            fullWidth
            label="Monto a abonar hoy"
            type="number"
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            disabled={saving}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            autoFocus
          />

          {/* Live feedback of remaining balance */}
          {parsedInstallment > 0 && parsedInstallment <= currentPending && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                p: 1.2,
                borderRadius: 2,
                backgroundColor: remainingAfterInstallment === 0 ? "#D1FAE5" : "#FEF3C7",
                color: remainingAfterInstallment === 0 ? "#065F46" : "#B45309",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {remainingAfterInstallment === 0
                  ? "✅ El pago quedará saldado en su totalidad"
                  : "Nuevo saldo pendiente tras este abono:"}
              </Typography>
              {remainingAfterInstallment > 0 && (
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {formatCurrency(remainingAfterInstallment)}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              label="Fecha del abono"
              type="date"
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
              disabled={saving}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              margin="dense"
              fullWidth
              label="Método de pago"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={saving}
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            margin="dense"
            fullWidth
            label="Referencia o comprobante (opcional)"
            placeholder="Ej: Nequi / Transferencia 4567"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={saving}
          />

          <TextField
            margin="dense"
            fullWidth
            label="Nota del abono (opcional)"
            placeholder="Ej: Segundo abono acordado"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          >
            {saving ? "Guardando…" : "Guardar abono"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
