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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Member, MemberStatus, UpdateMemberInput } from "@/types";

interface EditMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (memberId: string, input: UpdateMemberInput) => Promise<boolean>;
  saving: boolean;
}

export default function EditMemberDialog({
  open,
  onClose,
  member,
  onSave,
  saving,
}: EditMemberDialogProps) {
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<MemberStatus>("active");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || "");
      setDocumentNumber(member.document_number || "");
      setEmail(member.email || "");
      setPhone(member.phone || "");
      setStatus(member.status || "active");
      setNotes(member.notes || "");
      setError(null);
    }
  }, [member, open]);

  const handleClose = () => {
    if (!saving) {
      setError(null);
      onClose();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!fullName.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    const success = await onSave(member.id, {
      fullName: fullName.trim(),
      documentNumber: documentNumber.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      status,
      notes: notes.trim() || null,
    });

    if (success) {
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
              <EditIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Editar miembro
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Actualiza los datos personales o el estado del miembro.
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

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Documento de identidad"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              disabled={saving}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="member-status-label">Estado</InputLabel>
              <Select
                labelId="member-status-label"
                value={status}
                label="Estado"
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                disabled={saving}
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="frozen">Congelado</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
          </Box>

          <TextField
            margin="normal"
            fullWidth
            label="Notas / Observaciones"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleClose} disabled={saving} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
            sx={{ fontWeight: 700, minWidth: 120 }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

