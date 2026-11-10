"use client";

import React from "react";
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
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Member, MemberCustomPricing } from "@/types";
import { formatDate, getMemberStatusLabel, formatCurrency } from "@/utils/formatters";

interface MembersDialogProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  memberPricingMap?: Map<string, MemberCustomPricing>;
  onOpenRegisterMember: () => void;
  onViewMemberPayments: (member: Member) => void;
  onNewPaymentForMember: (member: Member) => void;
  onEditMemberTariff?: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
}

export default function MembersDialog({
  open,
  onClose,
  members,
  searchQuery,
  onSearchChange,
  loading,
  memberPricingMap,
  onOpenRegisterMember,
  onViewMemberPayments,
  onNewPaymentForMember,
  onEditMemberTariff,
  onEditMember,
  onDeleteMember,
}: MembersDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Miembros de la academia
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {members.length === 1 ? "1 miembro registrado" : `${members.length} miembros registrados`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={onOpenRegisterMember}
        >
          Nuevo miembro
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Search Input */}
        <TextField
          placeholder="Buscar por nombre, documento, correo o teléfono…"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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

        {/* List of members */}
        {loading && members.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : members.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {searchQuery ? "No se encontraron miembros." : "Aún no hay miembros registrados."}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 420, overflow: "auto" }}>
            {members.map((member, index) => {
              const contact = [member.phone, member.email].filter(Boolean).join(" · ");
              const customPricing = memberPricingMap?.get(member.id);
              const hasCustom = Boolean(
                customPricing &&
                  ((customPricing.AmountMonthCordoba && customPricing.AmountMonthCordoba > 0) ||
                    (customPricing.AmountMonthDollar && customPricing.AmountMonthDollar > 0))
              );

              return (
                <React.Fragment key={member.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
                        {member.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {member.full_name}
                          </Typography>
                          <Chip
                            label={getMemberStatusLabel(member.status)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              backgroundColor:
                                member.status === "active"
                                  ? "#DDF3E4"
                                  : member.status === "frozen"
                                  ? "#FEF3D6"
                                  : "#FCE8E6",
                              color:
                                member.status === "active"
                                  ? "#176B3A"
                                  : member.status === "frozen"
                                  ? "#8A5800"
                                  : "#BA1A1A",
                            }}
                          />
                          {hasCustom && (
                            <Chip
                              label="Tarifa personalizada"
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {member.document_number ? `Doc: ${member.document_number} · ` : ""}
                            {contact || "Sin datos de contacto"}
                          </Typography>
                          {hasCustom ? (
                            <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 700, display: "block" }}>
                              Tarifa asignada:{" "}
                              {[
                                customPricing?.AmountMonthCordoba
                                  ? formatCurrency(customPricing.AmountMonthCordoba, "NIO")
                                  : null,
                                customPricing?.AmountMonthDollar
                                  ? formatCurrency(customPricing.AmountMonthDollar, "USD")
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" / ")}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              Tarifa general del sistema
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Ingreso: {formatDate(member.joined_on)}
                          </Typography>
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", gap: 0.75, alignSelf: "center", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                      {onEditMember && (
                        <Tooltip title="Editar datos">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEditMember(member)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDeleteMember && (
                        <Tooltip title="Eliminar miembro">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteMember(member)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEditMemberTariff && (
                        <Button
                          size="small"
                          variant="text"
                          color={hasCustom ? "secondary" : "inherit"}
                          startIcon={<MonetizationOnIcon />}
                          onClick={() => onEditMemberTariff(member)}
                        >
                          Tarifa
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => {
                          onViewMemberPayments(member);
                          onClose();
                        }}
                      >
                        Pagos
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<PaymentIcon />}
                        onClick={() => {
                          onNewPaymentForMember(member);
                          onClose();
                        }}
                      >
                        Pagar
                      </Button>
                    </Box>
                  </ListItem>
                  {index < members.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

