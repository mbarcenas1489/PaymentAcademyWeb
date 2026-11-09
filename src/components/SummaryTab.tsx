"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Button,
  Stack,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaymentsIcon from "@mui/icons-material/Payments";
import { MemberPaymentSummary } from "@/types";
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  getMemberStatusLabel,
  getPaymentTypeLabel,
  getPaymentMethodLabel,
  getPaymentValidityStatus,
} from "@/utils/formatters";

interface SummaryTabProps {
  summaries: MemberPaymentSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  monthlyTotal: number;
  loading: boolean;
  onSelectMemberPayments: (member: MemberPaymentSummary) => void;
  onNewPaymentForMember: (member: MemberPaymentSummary) => void;
  onInstallmentForMember?: (member: MemberPaymentSummary) => void;
  onOpenNewMember: () => void;
}

export default function SummaryTab({
  summaries,
  searchQuery,
  onSearchChange,
  monthlyTotal,
  loading,
  onSelectMemberPayments,
  onNewPaymentForMember,
  onInstallmentForMember,
  onOpenNewMember,
}: SummaryTabProps) {
  return (
    <Box sx={{ py: 2 }}>
      {/* Monthly Total Card */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #0F766E 0%, #10B981 100%)",
          color: "#FFFFFF",
          borderRadius: 4,
          boxShadow: "0 6px 20px rgba(15, 118, 110, 0.25)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.9 }}>
            TOTAL DE {formatMonthYear().toUpperCase()}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
            {formatCurrency(monthlyTotal)}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Recaudación mensual registrada en la academia
          </Typography>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          placeholder="Buscar por nombre, documento o teléfono…"
          size="small"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 260, backgroundColor: "#FFFFFF" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PersonIcon />}
          onClick={onOpenNewMember}
          sx={{ whiteSpace: "nowrap" }}
        >
          Nuevo miembro
        </Button>
      </Box>

      {/* Loading state */}
      {loading && summaries.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : summaries.length === 0 ? (
        /* Empty state */
        <Card sx={{ p: 5, textAlign: "center", backgroundColor: "background.paper", borderRadius: 4 }}>
          <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700 }}>
            {searchQuery ? "No se encontraron miembros" : "Aún no hay miembros registrados"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}>
            {searchQuery
              ? "Prueba buscando con otro término o número de documento."
              : "Registra tu primer miembro para comenzar a controlar los pagos."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onOpenNewMember}
          >
            Registrar nuevo miembro
          </Button>
        </Card>
      ) : (
        /* Members and Last Payment List */
        <Grid container spacing={2}>
          {summaries.map((m) => {
            const hasPayment = !!m.lastPaymentId;
            const validity = hasPayment
              ? getPaymentValidityStatus(m.lastValidFrom, m.lastValidUntil)
              : null;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={m.memberId}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 18px rgba(37, 26, 20, 0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Member header */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: 700,
                            width: 44,
                            height: 44,
                          }}
                        >
                          {m.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                            {m.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {[m.documentNumber, m.phone, m.email].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={getMemberStatusLabel(m.memberStatus)}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          backgroundColor:
                            m.memberStatus === "active"
                              ? "#D1FAE5"
                              : m.memberStatus === "frozen"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                          color:
                            m.memberStatus === "active"
                              ? "#065F46"
                              : m.memberStatus === "frozen"
                              ? "#B45309"
                              : "#B91C1C",
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Last Payment section */}
                    <Box sx={{ backgroundColor: "action.hover", p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
                          Último pago
                        </Typography>

                        {validity && (
                          <Chip
                            icon={
                              validity.status === "current" ? (
                                <CheckCircleOutlinedIcon sx={{ fontSize: "1rem !important" }} />
                              ) : validity.status === "upcoming" ? (
                                <ScheduleIcon sx={{ fontSize: "1rem !important" }} />
                              ) : (
                                <EventBusyIcon sx={{ fontSize: "1rem !important" }} />
                              )
                            }
                            label={validity.label}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              backgroundColor:
                                validity.status === "current"
                                  ? "#D1FAE5"
                                  : validity.status === "upcoming"
                                  ? "#FEF3C7"
                                  : "#FEE2E2",
                              color:
                                validity.status === "current"
                                  ? "#065F46"
                                  : validity.status === "upcoming"
                                  ? "#B45309"
                                  : "#B91C1C",
                            }}
                          />
                        )}
                      </Box>

                      {hasPayment ? (
                        <>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                              {formatCurrency(m.lastAmount)}
                            </Typography>
                            {(m.lastPendingAmount ?? 0) > 0 && (
                              <Chip
                                label={`Debe: ${formatCurrency(m.lastPendingAmount)}`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  backgroundColor: "#FEF3C7",
                                  color: "#B45309",
                                }}
                              />
                            )}
                          </Box>
                          {(m.lastPendingAmount ?? 0) > 0 && (
                            <Typography variant="caption" sx={{ color: "#B45309", fontWeight: 700, display: "block" }}>
                              Abonado: {formatCurrency(m.lastAmount)} de{" "}
                              {formatCurrency((m.lastAmount || 0) + (m.lastPendingAmount || 0))}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {getPaymentTypeLabel(m.lastPaymentType)} · {getPaymentMethodLabel(m.lastPaymentMethod)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                            Pagado: {formatDate(m.lastPaidOn)} · Vigencia hasta: {formatDate(m.lastValidUntil)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", py: 0.5 }}>
                          Sin pagos registrados
                        </Typography>
                      )}
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => onSelectMemberPayments(m)}
                        sx={{ fontSize: "0.78rem", flex: 1 }}
                      >
                        Historial
                      </Button>
                      {(m.lastPendingAmount ?? 0) > 0 && onInstallmentForMember && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<PaymentsIcon />}
                          onClick={() => onInstallmentForMember(m)}
                          sx={{ fontSize: "0.78rem", flex: 1, fontWeight: 700 }}
                        >
                          Abonar
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<PaymentIcon />}
                        onClick={() => onNewPaymentForMember(m)}
                        sx={{ fontSize: "0.78rem", flex: 1 }}
                      >
                        Nuevo pago
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
