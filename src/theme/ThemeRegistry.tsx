"use client";

import * as React from "react";
import { AppThemeProvider } from "./ThemeContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
