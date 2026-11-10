"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Member } from "@/types";

interface ConfirmDeleteMemberDialogProps {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export default function ConfirmDeleteMemberDialog({
  open,
  member,
  onClose,
  onConfirm,
  loading,
}: ConfirmDeleteMemberDialogProps) {
  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "error.light",
              color: "error.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DeleteIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Eliminar miembro
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <DialogContentText sx={{ color: "text.primary", mb: 2 }}>
          ¿Estás seguro de que deseas eliminar a{" "}
          <strong>{member?.full_name || "este miembro"}</strong>?
        </DialogContentText>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
          }}
        >
          <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 20, mt: 0.2 }} />
          <Typography variant="caption" sx={{ color: "#991B1B", lineHeight: 1.4 }}>
            El miembro y sus pagos asociados serán dados de baja del sistema
            (eliminación lógica). No aparecerán en los listados activos ni en los resúmenes financieros.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          sx={{ fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Eliminar miembro"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
