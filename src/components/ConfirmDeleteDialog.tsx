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
} from "@mui/material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  memberName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export default function ConfirmDeleteDialog({
  open,
  memberName,
  onClose,
  onConfirm,
  loading,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Eliminar pago</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Deseas eliminar el pago de <strong>{memberName || "este miembro"}</strong>? Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

