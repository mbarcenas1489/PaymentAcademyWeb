"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import LoginView from "@/components/LoginView";
import DashboardView from "@/components/DashboardView";

export default function Home() {
  const { user, isAuthenticated, loading, error, signIn, signOut, clearError } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <LoginView
        onLogin={signIn}
        loading={loading}
        error={error}
        onClearError={clearError}
      />
    );
  }

  return <DashboardView user={user} onSignOut={signOut} />;
}
