"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { NewMemberInput, Member, PaymentSettingValue } from "@/types";
import { formatCurrency } from "@/utils/formatters";

interface RegisterMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: NewMemberInput) => Promise<Member | null>;
  saving: boolean;
  defaultPaymentSetting?: PaymentSettingValue;
}

export default function RegisterMemberDialog({
  open,
  onClose,
  onSave,
  saving,
  defaultPaymentSetting,
}: RegisterMemberDialogProps) {
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Custom tariff state
  const [isCustomTariff, setIsCustomTariff] = useState(false);
  const [customCordoba, setCustomCordoba] = useState("");
  const [customDollar, setCustomDollar] = useState("");

  const [error, setError] = useState<string | null>(null);

  const defaultCordoba = defaultPaymentSetting?.AmountMonthCordoba ?? 750;
  const defaultDollar = defaultPaymentSetting?.AmountMonthDollar ?? 20;

  const resetForm = () => {
    setFullName("");
    setDocumentNumber("");
    setEmail("");
    setPhone("");
    setNotes("");
    setIsCustomTariff(false);
    setCustomCordoba("");
    setCustomDollar("");
    setError(null);
  };

  const handleToggleCustomTariff = (checked: boolean) => {
    setIsCustomTariff(checked);
    if (checked) {
      if (!customCordoba) setCustomCordoba(String(defaultCordoba));
      if (!customDollar) setCustomDollar(String(defaultDollar));
    }
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    let customPricing = null;
    if (isCustomTariff) {
      const parsedCordoba = parseFloat(customCordoba.replace(/,/g, "."));
      const parsedDollar = parseFloat(customDollar.replace(/,/g, "."));

      if (isNaN(parsedCordoba) || parsedCordoba <= 0) {
        setError("Ingresa una tarifa válida en Córdobas (mayor a 0).");
        return;
      }
      if (isNaN(parsedDollar) || parsedDollar <= 0) {
        setError("Ingresa una tarifa válida en Dólares (mayor a 0).");
        return;
      }

      customPricing = {
        AmountMonthCordoba: parsedCordoba,
        AmountMonthDollar: parsedDollar,
      };
    }

    const created = await onSave({
      fullName,
      documentNumber,
      email,
      phone,
      notes,
      customPricing,
    });

    if (created) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSave} noValidate>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonAddIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Nuevo miembro
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Agrega un atleta o cliente a tu organización.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Nombre completo"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError(null);
            }}
            disabled={saving}
            autoFocus
          />

          <TextField
            margin="normal"
            fullWidth
            label="Documento de identidad"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            disabled={saving}
          />

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={saving}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Correo electrónico (opcional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
          </Box>

          <TextField
            margin="normal"
            fullWidth
            label="Notas"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
          />

          {/* Custom tariff configuration section */}
          <Card
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              backgroundColor: isCustomTariff ? "action.hover" : "background.paper",
              borderColor: isCustomTariff ? "primary.main" : "divider",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isCustomTariff}
                  onChange={(e) => handleToggleCustomTariff(e.target.checked)}
                  color="primary"
                  disabled={saving}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <MonetizationOnIcon
                    fontSize="small"
                    color={isCustomTariff ? "primary" : "action"}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ¿Asignar tarifa personalizada a este miembro?
                  </Typography>
                </Box>
              }
            />
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", ml: 4, mt: -0.5 }}>
              {isCustomTariff
                ? "Este miembro tendrá un cobro mensual específico que tendrá prioridad sobre la configuración general."
                : `Desactivado: usará la tarifa mensual general (${formatCurrency(defaultCordoba, "NIO")} / ${formatCurrency(defaultDollar, "USD")}).`}
            </Typography>

            {isCustomTariff && (
              <Box sx={{ display: "flex", gap: 2, mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  label="Tarifa en Córdobas"
                  type="number"
                  placeholder={`Ej: ${defaultCordoba}`}
                  value={customCordoba}
                  onChange={(e) => setCustomCordoba(e.target.value)}
                  disabled={saving}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">C$</InputAdornment>,
                    },
                  }}
                />

                <TextField
                  margin="dense"
                  required
                  fullWidth
                  label="Tarifa en Dólares"
                  type="number"
                  placeholder={`Ej: ${defaultDollar}`}
                  value={customDollar}
                  onChange={(e) => setCustomDollar(e.target.value)}
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

          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1.5 }}>
            💡 Se registrará como miembro activo con la fecha de ingreso de hoy.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving || !fullName.trim()}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : "Guardar miembro"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

