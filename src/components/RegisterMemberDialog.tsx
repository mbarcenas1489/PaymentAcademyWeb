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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { NewMemberInput, Member } from "@/types";

interface RegisterMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: NewMemberInput) => Promise<Member | null>;
  saving: boolean;
}

export default function RegisterMemberDialog({
  open,
  onClose,
  onSave,
  saving,
}: RegisterMemberDialogProps) {
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setDocumentNumber("");
    setEmail("");
    setPhone("");
    setNotes("");
    setError(null);
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

    const created = await onSave({
      fullName,
      documentNumber,
      email,
      phone,
      notes,
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

