"use client";

import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckIcon from "@mui/icons-material/Check";
import { useAppTheme, AppThemeMode } from "@/theme/ThemeContext";

export default function ThemeSelector() {
  const { mode, setMode } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedMode: AppThemeMode) => {
    setMode(selectedMode);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Cambiar tema (Claro / Oscuro / Azul)">
        <IconButton onClick={handleClick} color="inherit" size="small">
          {mode === "dark" ? (
            <DarkModeIcon sx={{ color: "#E88960" }} />
          ) : mode === "blue" ? (
            <WaterDropIcon sx={{ color: "#0B5ED7" }} />
          ) : (
            <PaletteIcon sx={{ color: "#0F766E" }} />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { borderRadius: 3, minWidth: 170, py: 0.5 },
          },
        }}
      >
        <MenuItem onClick={() => handleSelect("light")} selected={mode === "light"}>
          <ListItemIcon>
            <LightModeIcon fontSize="small" sx={{ color: "#0F766E" }} />
          </ListItemIcon>
          <ListItemText>Modo Claro</ListItemText>
          {mode === "light" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <MenuItem onClick={() => handleSelect("dark")} selected={mode === "dark"}>
          <ListItemIcon>
            <DarkModeIcon fontSize="small" sx={{ color: "#E88960" }} />
          </ListItemIcon>
          <ListItemText>Modo Oscuro</ListItemText>
          {mode === "dark" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>

        <MenuItem onClick={() => handleSelect("blue")} selected={mode === "blue"}>
          <ListItemIcon>
            <WaterDropIcon fontSize="small" sx={{ color: "#0B5ED7" }} />
          </ListItemIcon>
          <ListItemText>Modo Azul</ListItemText>
          {mode === "blue" && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </>
  );
}

