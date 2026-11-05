"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PeopleIcon from "@mui/icons-material/People";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import { OrganizationRoleType } from "@/types";
import ThemeSelector from "./ThemeSelector";

interface NavbarProps {
  userEmail: string | null;
  role: OrganizationRoleType;
  onOpenMembers: () => void;
  onOpenNewPayment: () => void;
  onRefresh: () => void;
  onSignOut: () => void;
  loading?: boolean;
}

export default function Navbar({
  userEmail,
  role,
  onOpenMembers,
  onOpenNewPayment,
  onRefresh,
  onSignOut,
  loading,
}: NavbarProps) {
  const roleLabel = role === "owner" ? "Propietario" : role === "admin" ? "Administrador" : "Staff";
  const roleColor = role === "owner" ? "secondary" : role === "admin" ? "primary" : "default";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
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
            <FitnessCenterIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
              Payment Academy
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={roleLabel}
                size="small"
                color={roleColor as "secondary" | "primary" | "default"}
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
              {userEmail && (
                <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "inline" } }}>
                  {userEmail}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ThemeSelector />

          <Tooltip title="Actualizar datos">
            <IconButton onClick={onRefresh} disabled={loading} color="primary" size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<PeopleIcon />}
            onClick={onOpenMembers}
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Miembros
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleIcon />}
            onClick={onOpenNewPayment}
            size="small"
          >
            Nuevo pago
          </Button>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={onSignOut} color="error" size="small">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
