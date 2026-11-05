"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function LoginView({
  onLogin,
  loading,
  error,
  onClearError,
}: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email, password);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            p: 2,
            borderRadius: 4,
            boxShadow: "0 8px 30px rgba(15, 118, 110, 0.08)",
          }}
        >
          <CardContent sx={{ textAlign: "center", pt: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)",
              }}
            >
              <FitnessCenterIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              Payment Academy
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
              Control de pagos
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Administra tu academia o gimnasio desde un solo lugar.
            </Typography>

            {error && (
              <Alert severity="error" onClose={onClearError} sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading || !email || !password}
                sx={{
                  mt: 3,
                  mb: 1,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
