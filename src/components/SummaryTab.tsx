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
  onOpenNewMember,
}: SummaryTabProps) {
  return (
    <Box sx={{ py: 2 }}>
      {/* Monthly Total Card */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #8B3D1F 0%, #A04724 100%)",
          color: "#FFFFFF",
          borderRadius: 4,
          boxShadow: "0 6px 20px rgba(139, 61, 31, 0.25)",
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
                  <SearchIcon sx={{ color: "#8B3D1F" }} />
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
        <Card sx={{ p: 5, textAlign: "center", backgroundColor: "#FFFFFF", borderRadius: 4 }}>
          <PersonIcon sx={{ fontSize: 48, color: "#765F52", mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: "#251A14", fontWeight: 700 }}>
            {searchQuery ? "No se encontraron miembros" : "Aún no hay miembros registrados"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#765F52", mt: 0.5, mb: 2 }}>
            {searchQuery
              ? "Prueba buscando con otro término o número de documento."
              : "Registra tu primer miembro para comenzar a controlar los pagos."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onOpenNewMember}
            sx={{ backgroundColor: "#8B3D1F" }}
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
                            bgcolor: "#8B3D1F",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            width: 44,
                            height: 44,
                          }}
                        >
                          {m.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#251A14", lineHeight: 1.2 }}>
                            {m.fullName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#765F52" }}>
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
                              ? "#DDF3E4"
                              : m.memberStatus === "frozen"
                              ? "#FEF3D6"
                              : "#FCE8E6",
                          color:
                            m.memberStatus === "active"
                              ? "#176B3A"
                              : m.memberStatus === "frozen"
                              ? "#8A5800"
                              : "#BA1A1A",
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Last Payment section */}
                    <Box sx={{ backgroundColor: "#FBF8F5", p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#765F52", textTransform: "uppercase" }}>
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
                        )}
                      </Box>

                      {hasPayment ? (
                        <>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: "#251A14" }}>
                            {formatCurrency(m.lastAmount)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#765F52" }}>
                            {getPaymentTypeLabel(m.lastPaymentType)} · {getPaymentMethodLabel(m.lastPaymentMethod)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#765F52", display: "block", mt: 0.5 }}>
                            Pagado: {formatDate(m.lastPaidOn)} · Vigencia hasta: {formatDate(m.lastValidUntil)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ color: "#765F52", fontStyle: "italic", py: 0.5 }}>
                          Sin pagos registrados
                        </Typography>
                      )}
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => onSelectMemberPayments(m)}
                        fullWidth
                        sx={{ fontSize: "0.8rem" }}
                      >
                        Ver historial
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => onNewPaymentForMember(m)}
                        fullWidth
                        sx={{
                          fontSize: "0.8rem",
                          backgroundColor: "#8B3D1F",
                          "&:hover": { backgroundColor: "#5C2611" },
                        }}
                      >
                        Registrar pago
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
