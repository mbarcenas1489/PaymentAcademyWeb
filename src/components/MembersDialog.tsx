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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import { Member } from "@/types";
import { formatDate, getMemberStatusLabel } from "@/utils/formatters";

interface MembersDialogProps {
  open: boolean;
  onClose: () => void;
  members: Member[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading: boolean;
  onOpenRegisterMember: () => void;
  onViewMemberPayments: (member: Member) => void;
  onNewPaymentForMember: (member: Member) => void;
}

export default function MembersDialog({
  open,
  onClose,
  members,
  searchQuery,
  onSearchChange,
  loading,
  onOpenRegisterMember,
  onViewMemberPayments,
  onNewPaymentForMember,
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {member.document_number ? `Doc: ${member.document_number} · ` : ""}
                            {contact || "Sin datos de contacto"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Ingreso: {formatDate(member.joined_on)}
                          </Typography>
                        </Box>
                      }
                    />

                    <Box sx={{ display: "flex", gap: 1, alignSelf: "center" }}>
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

