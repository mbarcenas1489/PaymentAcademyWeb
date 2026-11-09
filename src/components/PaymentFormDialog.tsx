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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Radio,
  MenuItem,
  Card,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import {
  Member,
  PaymentDraft,
  PaymentMethod,
  PaymentType,
  PaymentSummary,
  PaymentSettingValue,
  PaymentCurrency,
} from "@/types";
import {
  formatCurrency,
  formatDate,
  addOneMonth,
  getPaymentTypeLabel,
  getPaymentMethodLabel,
  getCurrencySymbol,
  getCurrencyLabel,
} from "@/utils/formatters";

interface PaymentFormDialogProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  initialMember?: Member | null;
  editingPayment?: PaymentSummary | null;
  paymentSetting: PaymentSettingValue;
  onSave: (draft: PaymentDraft, paymentId?: string) => Promise<string | null>;
  saving: boolean;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "online", label: "Pago en línea" },
  { value: "other", label: "Otro" },
];

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "monthly_fee", label: "Mensualidad" },
  { value: "enrollment", label: "Matrícula o inscripción" },
  { value: "class_package", label: "Paquete de clases" },
  { value: "personal_training", label: "Entrenamiento personal" },
  { value: "other", label: "Otro concepto" },
];

export default function PaymentFormDialog({
  open,
  onClose,
  members,
  initialMember,
  editingPayment,
  paymentSetting,
  onSave,
  saving,
}: PaymentFormDialogProps) {
  const isEditing = Boolean(editingPayment);
  const lockedMemberId = initialMember?.id || editingPayment?.member_id;
  const firstStep = lockedMemberId ? 2 : 1;
  const totalSteps = 4;

  const [currentStep, setCurrentStep] = useState<number>(firstStep);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState<string>("");

  // Step 2 Details
  const [currency, setCurrency] = useState<PaymentCurrency>("NIO");
  const [amount, setAmount] = useState<string>("");
  const [paidOn, setPaidOn] = useState<string>("");
  const [paymentType, setPaymentType] = useState<PaymentType>("monthly_fee");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // Step 3 Validity
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");

  // Step 4 Optional
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const expectedMonthlyAmount =
    currency === "USD"
      ? Number(paymentSetting?.AmountMonthDollar || 20)
      : Number(paymentSetting?.AmountMonthCordoba || 750);
  const parsedAmount = parseFloat(amount.replace(/,/g, ".")) || 0;
  const computedPending =
    parsedAmount > 0 && parsedAmount < expectedMonthlyAmount
      ? Number((expectedMonthlyAmount - parsedAmount).toFixed(2))
      : 0;
  const isAutoPartial = computedPending > 0;

  // Initialize form state
  useEffect(() => {
    if (!open) return;

    const today = new Date().toISOString().split("T")[0];

    if (editingPayment) {
      const mem = members.find((m) => m.id === editingPayment.member_id) || null;
      const existingPaid = Number(editingPayment.amount || 0);
      const existingCurrency = editingPayment.currency === "USD" ? "USD" : "NIO";
      setSelectedMember(mem);
      setCurrency(existingCurrency);
      setAmount(String(existingPaid));
      setPaidOn(editingPayment.paid_on || today);
      setPaymentType(editingPayment.payment_type);
      setPaymentMethod(editingPayment.payment_method);
      setValidFrom(editingPayment.valid_from || today);
      setValidUntil(editingPayment.valid_until || addOneMonth(today));
      setReference(editingPayment.reference || "");
      setNotes(editingPayment.notes || "");
      setCurrentStep(2);
    } else {
      if (initialMember) {
        setSelectedMember(initialMember);
        setCurrentStep(2);
      } else {
        setSelectedMember(null);
        setCurrentStep(1);
      }
      setCurrency("NIO");
      setAmount(String(paymentSetting?.AmountMonthCordoba || 750));
      setPaidOn(today);
      setPaymentType("monthly_fee");
      setPaymentMethod("cash");
      setValidFrom(today);
      setValidUntil(addOneMonth(today));
      setReference("");
      setNotes("");
    }
    setError(null);
    setMemberSearch("");
  }, [
    open,
    editingPayment,
    initialMember,
    members,
    paymentSetting?.AmountMonthCordoba,
  ]);

  const handleCurrencyChange = (newCurrency: PaymentCurrency) => {
    setCurrency(newCurrency);
    const prevExpected =
      currency === "USD"
        ? Number(paymentSetting?.AmountMonthDollar || 20)
        : Number(paymentSetting?.AmountMonthCordoba || 750);
    const nextExpected =
      newCurrency === "USD"
        ? Number(paymentSetting?.AmountMonthDollar || 20)
        : Number(paymentSetting?.AmountMonthCordoba || 750);
    if (!amount || parsedAmount === prevExpected) {
      setAmount(String(nextExpected));
    }
  };

  // Handle auto updating validUntil when validFrom changes
  const handleValidFromChange = (newFrom: string) => {
    setValidFrom(newFrom);
    if (newFrom) {
      setValidUntil(addOneMonth(newFrom));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!selectedMember) {
        setError("Selecciona un miembro para continuar.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Ingresa un valor mayor que cero.");
        return false;
      }
      if (!paidOn) {
        setError("Selecciona una fecha de pago válida.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!validFrom) {
        setError("Selecciona la fecha inicial de vigencia.");
        return false;
      }
      if (!validUntil) {
        setError("Selecciona la fecha final de vigencia.");
        return false;
      }
      if (validUntil < validFrom) {
        setError("La fecha final no puede ser anterior a la fecha inicial.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, firstStep));
  };

  const handleSave = async () => {
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    if (!selectedMember) {
      setError("No se ha seleccionado un miembro.");
      return;
    }

    const draft: PaymentDraft = {
      memberId: selectedMember.id,
      amount: parsedAmount,
      pendingAmount: computedPending,
      currency,
      paidOn,
      paymentType,
      paymentMethod,
      validFrom,
      validUntil,
      reference: reference.trim() || null,
      notes: notes.trim() || null,
    };

    const savedId = await onSave(draft, editingPayment?.id);
    if (savedId) {
      onClose();
    }
  };

  // Filter members in Step 1
  const filteredMembers = members.filter((m) => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.document_number?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const visibleStepNumber = currentStep - firstStep + 1;
  const visibleStepTotal = totalSteps - firstStep + 1;
  const progressPercent = (visibleStepNumber / visibleStepTotal) * 100;

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {isEditing ? "Editar pago" : "Nuevo pago"}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
          Paso {visibleStepNumber} de {visibleStepTotal}:{" "}
          {currentStep === 1
            ? "Seleccionar miembro"
            : currentStep === 2
            ? "Monto y tipo de pago"
            : currentStep === 3
            ? "Período de vigencia"
            : "Revisión y confirmación"}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 2, minHeight: 320 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* STEP 1: Seleccionar miembro */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Busca por nombre, documento, teléfono o correo y selecciona un miembro.
            </Typography>

            <TextField
              placeholder="Buscar miembro…"
              size="small"
              fullWidth
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "primary.main" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {selectedMember && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Seleccionado: {selectedMember.full_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {[selectedMember.document_number, selectedMember.phone].filter(Boolean).join(" · ")}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" />
              </Box>
            )}

            <List sx={{ maxHeight: 240, overflow: "auto" }}>
              {filteredMembers.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                return (
                  <ListItem
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setError(null);
                    }}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isSelected ? "action.selected" : "transparent",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Radio checked={isSelected} size="small" sx={{ mr: 1 }} />
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: "0.9rem" }}>
                        {m.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={m.full_name}
                      secondary={[m.document_number, m.phone].filter(Boolean).join(" · ")}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* STEP 2: Monto y tipo */}
        {currentStep === 2 && (
          <Box>
            {selectedMember && (
              <Box sx={{ p: 1.5, mb: 1.5, borderRadius: 2, backgroundColor: "action.hover" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  Miembro a pagar:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedMember.full_name}
                </Typography>
              </Box>
            )}

            {/* Currency Selector & Monthly Tariff Reference */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  Moneda:
                </Typography>
                <Chip
                  label={`Córdobas (C$)`}
                  size="small"
                  color={currency === "NIO" ? "primary" : "default"}
                  variant={currency === "NIO" ? "filled" : "outlined"}
                  onClick={() => handleCurrencyChange("NIO")}
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                />
                <Chip
                  label={`Dólares ($)`}
                  size="small"
                  color={currency === "USD" ? "primary" : "default"}
                  variant={currency === "USD" ? "filled" : "outlined"}
                  onClick={() => handleCurrencyChange("USD")}
                  sx={{ fontWeight: 700, cursor: "pointer" }}
                />
              </Box>

              <Chip
                label={`Mensualidad: ${formatCurrency(expectedMonthlyAmount, currency)}`}
                size="small"
                color={parsedAmount === expectedMonthlyAmount ? "primary" : "default"}
                variant={parsedAmount === expectedMonthlyAmount ? "filled" : "outlined"}
                onClick={() => setAmount(String(expectedMonthlyAmount))}
                sx={{ fontWeight: 700, cursor: "pointer" }}
              />
            </Box>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Valor recibido"
              type="number"
              placeholder={`Ej: ${expectedMonthlyAmount}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={saving}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {getCurrencySymbol(currency)}
                    </InputAdornment>
                  ),
                },
              }}
              autoFocus
            />

            {/* Automatic Partial Payment Detection Banner */}
            {parsedAmount > 0 && (
              <Box
                sx={{
                  mt: 0.5,
                  mb: 1,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isAutoPartial ? "#FEF3C7" : "#D1FAE5",
                  color: isAutoPartial ? "#B45309" : "#065F46",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {isAutoPartial ? (
                  <>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        Abono parcial detectado automáticamente
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
                        Valor mensual: {formatCurrency(expectedMonthlyAmount, currency)} · Abono hoy:{" "}
                        {formatCurrency(parsedAmount, currency)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
                        Saldo pendiente:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                        {formatCurrency(computedPending, currency)}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ✅ Pago mensual completo ({formatCurrency(expectedMonthlyAmount, currency)})
                  </Typography>
                )}
              </Box>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Fecha de pago"
              type="date"
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
              disabled={saving}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                select
                margin="normal"
                fullWidth
                label="Tipo de pago"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                disabled={saving}
              >
                {PAYMENT_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                margin="normal"
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
          </Box>
        )}

        {/* STEP 3: Vigencia */}
        {currentStep === 3 && (
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Por defecto inicia hoy y termina un mes después. Puedes cambiar ambas fechas.
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Válido desde"
              type="date"
              value={validFrom}
              onChange={(e) => handleValidFromChange(e.target.value)}
              disabled={saving}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Válido hasta"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              disabled={saving}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              💡 El sistema validará que no exista otro pago para este miembro que se solape con este período.
            </Typography>
          </Box>
        )}

        {/* STEP 4: Información adicional y revisión */}
        {currentStep === 4 && (
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Referencia o comprobante (opcional)"
              placeholder="Ej: Transferencia N° 12345"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={saving}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Notas (opcional)"
              placeholder="Observaciones adicionales"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={saving}
            />

            {/* Review Summary Card */}
            <Card sx={{ mt: 2, p: 2, borderRadius: 3, backgroundColor: "action.hover" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}>
                Resumen del pago:
              </Typography>
              <Typography variant="body2">
                👤 <strong>Miembro:</strong> {selectedMember?.full_name}
              </Typography>
              <Typography variant="body2">
                💱 <strong>Moneda:</strong> {getCurrencyLabel(currency)}
              </Typography>
              {isAutoPartial ? (
                <>
                  <Typography variant="body2">
                    📊 <strong>Valor mensual configurado:</strong>{" "}
                    {formatCurrency(expectedMonthlyAmount, currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "success.main" }}>
                    💰 <strong>Abonado hoy:</strong> {formatCurrency(parsedAmount, currency)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 700 }}>
                    ⚠️ <strong>Saldo pendiente:</strong> {formatCurrency(computedPending, currency)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">
                  💰 <strong>Valor:</strong> {formatCurrency(parsedAmount, currency)}
                </Typography>
              )}
              <Typography variant="body2">
                🏷 <strong>Concepto:</strong> {getPaymentTypeLabel(paymentType)} (
                {getPaymentMethodLabel(paymentMethod)})
              </Typography>
              <Typography variant="body2">
                🗓 <strong>Vigencia:</strong> {formatDate(validFrom)} al {formatDate(validUntil)}
              </Typography>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
        <Button
          onClick={handlePrevious}
          disabled={currentStep === firstStep || saving}
          startIcon={<ArrowBackIcon />}
          sx={{ visibility: currentStep === firstStep ? "hidden" : "visible" }}
        >
          Anterior
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} disabled={saving} color="inherit">
            Cancelar
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            >
              {saving ? "Guardando…" : isEditing ? "Actualizar pago" : "Guardar pago"}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}

