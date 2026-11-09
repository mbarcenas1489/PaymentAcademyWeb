"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stack,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CloseIcon from "@mui/icons-material/Close";
import PaymentsIcon from "@mui/icons-material/Payments";
import { PaymentSummary } from "@/types";
import {
  formatCurrency,
  formatDate,
  getPaymentTypeLabel,
  getPaymentMethodLabel,
  getPaymentValidityStatus,
} from "@/utils/formatters";

interface MovementsTabProps {
  payments: PaymentSummary[];
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onApplyFilter: () => void;
  loading: boolean;
  canManagePayments: boolean;
  selectedMemberName?: string | null;
  onClearMemberFilter?: () => void;
  onEditPayment: (payment: PaymentSummary) => void;
  onDeletePayment: (payment: PaymentSummary) => void;
  onShareReceipt: (payment: PaymentSummary) => void;
  onRegisterInstallment: (payment: PaymentSummary) => void;
  onOpenNewPayment: () => void;
}

export default function MovementsTab({
  payments,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApplyFilter,
  loading,
  canManagePayments,
  selectedMemberName,
  onClearMemberFilter,
  onEditPayment,
  onDeletePayment,
  onShareReceipt,
  onRegisterInstallment,
  onOpenNewPayment,
}: MovementsTabProps) {
  const [menuAnchor, setMenuAnchor] = useState<{
    el: HTMLElement;
    payment: PaymentSummary;
  } | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, payment: PaymentSummary) => {
    setMenuAnchor({ el: event.currentTarget, payment });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Date Range Filter Card */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, backgroundColor: "background.paper" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
          Filtrar movimientos
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={onApplyFilter}
            disabled={loading}
            size="small"
            sx={{ height: 40 }}
          >
            Aplicar
          </Button>

          {(fromDate || toDate) && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={() => {
                onFromDateChange("");
                onToDateChange("");
              }}
            >
              Limpiar fechas
            </Button>
          )}
        </Box>

        {/* Member filter banner if filtered by member */}
        {selectedMemberName && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "action.hover",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Mostrando pagos de: <strong>{selectedMemberName}</strong>
            </Typography>
            {onClearMemberFilter && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={onClearMemberFilter}
              >
                Ver todos los miembros
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Movements Count */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          {payments.length === 1 ? "1 movimiento registrado" : `${payments.length} movimientos registrados`}
        </Typography>
      </Box>

      {/* Payments List */}
      {loading && payments.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : payments.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: 4 }}>
          <ReceiptIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Aún no hay pagos registrados
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}>
            No se encontraron movimientos con los filtros seleccionados.
          </Typography>
          <Button variant="contained" color="primary" onClick={onOpenNewPayment}>
            Agregar pago
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {payments.map((payment) => {
            const validity = getPaymentValidityStatus(payment.valid_from, payment.valid_until);

            return (
              <Card
                key={payment.id}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    {/* Member & Amount */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                          {payment.memberName}
                        </Typography>
                        {payment.memberDocument && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Doc: {payment.memberDocument}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                        {Number(payment.pending_amount || 0) > 0 && (
                          <Typography variant="caption" sx={{ color: "#B45309", fontWeight: 700, display: "block" }}>
                            Abonado de {formatCurrency(Number(payment.amount || 0) + Number(payment.pending_amount || 0))}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Metadata tags */}
                    <Box sx={{ display: "flex", gap: 1, my: 1, flexWrap: "wrap", alignItems: "center" }}>
                      {Number(payment.pending_amount || 0) > 0 && (
                        <Chip
                          label={`Abono parcial · Debe: ${formatCurrency(payment.pending_amount)}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            backgroundColor: "#FEF3C7",
                            color: "#B45309",
                          }}
                        />
                      )}
                      <Chip
                        label={getPaymentTypeLabel(payment.payment_type)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                      <Chip
                        label={getPaymentMethodLabel(payment.payment_method)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: "0.75rem", backgroundColor: "action.hover" }}
                      />
                      <Chip
                        icon={
                          validity.status === "current" ? (
                            <CheckCircleOutlinedIcon sx={{ fontSize: "0.9rem !important" }} />
                          ) : validity.status === "upcoming" ? (
                            <ScheduleIcon sx={{ fontSize: "0.9rem !important" }} />
                          ) : (
                            <EventBusyIcon sx={{ fontSize: "0.9rem !important" }} />
                          )
                        }
                        label={validity.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          backgroundColor:
                            validity.status === "current"
                              ? "#DDF3E4"
                              : validity.status === "upcoming"
                              ? "#FEF3D6"
                              : "#FCE8E6",
                          color:
                            validity.status === "current"
                              ? "#176B3A"
                              : validity.status === "upcoming"
                              ? "#8A5800"
                              : "#BA1A1A",
                        }}
                      />
                    </Box>

                    {/* Dates */}
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                      Pagado el <strong>{formatDate(payment.paid_on)}</strong> · Vigencia:{" "}
                      <strong>
                        {formatDate(payment.valid_from)} al {formatDate(payment.valid_until)}
                      </strong>
                    </Typography>

                    {payment.reference && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Ref: {payment.reference}
                      </Typography>
                    )}

                    {payment.notes && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", display: "block" }}>
                        Nota: {payment.notes}
                      </Typography>
                    )}

                    {canManagePayments && Number(payment.pending_amount || 0) > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<PaymentsIcon />}
                          onClick={() => onRegisterInstallment(payment)}
                          sx={{ fontWeight: 700, fontSize: "0.78rem" }}
                        >
                          Registrar abono ({formatCurrency(payment.pending_amount)})
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Actions button */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, payment)}
                    sx={{ color: "text.secondary" }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Payment Options Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 190 } } }}
      >
        {canManagePayments && Number(menuAnchor?.payment.pending_amount || 0) > 0 && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) onRegisterInstallment(menuAnchor.payment);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <PaymentsIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Registrar abono</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            if (menuAnchor) onShareReceipt(menuAnchor.payment);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Enviar comprobante</ListItemText>
        </MenuItem>

        {canManagePayments && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) onEditPayment(menuAnchor.payment);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Editar pago</ListItemText>
          </MenuItem>
        )}

        {canManagePayments && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) onDeletePayment(menuAnchor.payment);
              handleCloseMenu();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar pago</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
