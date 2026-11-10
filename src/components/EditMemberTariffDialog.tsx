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
  Switch,
  FormControlLabel,
  InputAdornment,
  Card,
  Chip,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { Member, MemberCustomPricing, PaymentSettingValue } from "@/types";
import { formatCurrency } from "@/utils/formatters";

interface EditMemberTariffDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  currentPricing?: MemberCustomPricing | null;
  defaultPaymentSetting?: PaymentSettingValue;
  onSave: (memberId: string, pricing: MemberCustomPricing) => Promise<boolean>;
  onRemove: (memberId: string) => Promise<boolean>;
  saving: boolean;
}

export default function EditMemberTariffDialog({
  open,
  onClose,
  member,
  currentPricing,
  defaultPaymentSetting,
  onSave,
  onRemove,
  saving,
}: EditMemberTariffDialogProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [amountCordoba, setAmountCordoba] = useState("");
  const [amountDollar, setAmountDollar] = useState("");
  const [error, setError] = useState<string | null>(null);

  const defaultCordoba = defaultPaymentSetting?.AmountMonthCordoba ?? 750;
  const defaultDollar = defaultPaymentSetting?.AmountMonthDollar ?? 20;

  useEffect(() => {
    if (!open || !member) return;

    if (currentPricing && (currentPricing.AmountMonthCordoba || currentPricing.AmountMonthDollar)) {
      setIsCustom(true);
      setAmountCordoba(String(currentPricing.AmountMonthCordoba ?? defaultCordoba));
      setAmountDollar(String(currentPricing.AmountMonthDollar ?? defaultDollar));
    } else {
      setIsCustom(false);
      setAmountCordoba(String(defaultCordoba));
      setAmountDollar(String(defaultDollar));
    }
    setError(null);
  }, [open, member, currentPricing, defaultCordoba, defaultDollar]);

  if (!member) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isCustom) {
      const parsedCordoba = parseFloat(amountCordoba.replace(/,/g, "."));
      const parsedDollar = parseFloat(amountDollar.replace(/,/g, "."));

      if (isNaN(parsedCordoba) || parsedCordoba <= 0) {
        setError("Ingresa una tarifa válida en Córdobas (mayor a 0).");
        return;
      }
      if (isNaN(parsedDollar) || parsedDollar <= 0) {
        setError("Ingresa una tarifa válida en Dólares (mayor a 0).");
        return;
      }

      const ok = await onSave(member.id, {
        AmountMonthCordoba: parsedCordoba,
        AmountMonthDollar: parsedDollar,
      });

      if (ok) {
        onClose();
      } else {
        setError("Error al guardar la tarifa personalizada.");
      }
    } else {
      // Return to global tariff
      const ok = await onRemove(member.id);
      if (ok) {
        onClose();
      } else {
        setError("Error al restablecer a la tarifa general.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="xs" fullWidth>
      <Box component="form" onSubmit={handleSave} noValidate>
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <MonetizationOnIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Tarifa de cobro
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {member.full_name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Current Status Box */}
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              backgroundColor: "action.hover",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              ESTADO ACTUAL:
            </Typography>
            <Chip
              label={
                currentPricing && (currentPricing.AmountMonthCordoba || currentPricing.AmountMonthDollar)
                  ? "Tarifa personalizada"
                  : "Tarifa global"
              }
              size="small"
              color={
                currentPricing && (currentPricing.AmountMonthCordoba || currentPricing.AmountMonthDollar)
                  ? "secondary"
                  : "default"
              }
              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
            />
          </Box>

          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: isCustom ? "action.hover" : "background.paper",
              borderColor: isCustom ? "primary.main" : "divider",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  color="primary"
                  disabled={saving}
                />
              }
              label={
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Activar tarifa personalizada
                </Typography>
              }
            />
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", ml: 4, mt: -0.5 }}>
              {isCustom
                ? "Este miembro tendrá un monto mensual fijo asignado que tendrá prioridad sobre el sistema."
                : `Desactivado: usará la tarifa mensual global (${formatCurrency(defaultCordoba, "NIO")} / ${formatCurrency(defaultDollar, "USD")}).`}
            </Typography>

            {isCustom && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  label="Tarifa en Córdobas"
                  type="number"
                  placeholder={`Ej: ${defaultCordoba}`}
                  value={amountCordoba}
                  onChange={(e) => setAmountCordoba(e.target.value)}
                  disabled={saving}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">C$</InputAdornment>,
                    },
                  }}
                  autoFocus
                />

                <TextField
                  margin="dense"
                  required
                  fullWidth
                  label="Tarifa en Dólares"
                  type="number"
                  placeholder={`Ej: ${defaultDollar}`}
                  value={amountDollar}
                  onChange={(e) => setAmountDollar(e.target.value)}
                  disabled={saving}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    },
                  }}
                />
              </Box>
            )}
          </Card>
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
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

