"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PaymentReceiptData } from "@/types";
import { useReceipt } from "@/hooks/useReceipt";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  data: PaymentReceiptData | null;
  isNewPayment?: boolean;
}

export default function ReceiptModal({
  open,
  onClose,
  data,
  isNewPayment = false,
}: ReceiptModalProps) {
  const { drawReceiptCanvas, downloadReceipt, shareViaWhatsApp } = useReceipt();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState<boolean>(false);

  useEffect(() => {
    if (open && data && canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = "";
      const canvas = drawReceiptCanvas(data);
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.borderRadius = "16px";
      canvas.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      canvasContainerRef.current.appendChild(canvas);
    }
  }, [open, data, drawReceiptCanvas]);

  if (!data) return null;

  const handleWhatsApp = async () => {
    setSharing(true);
    try {
      await shareViaWhatsApp(data);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pt: 3, pb: 1 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 44, mb: 0.5 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {isNewPayment ? "¡Pago guardado!" : "Comprobante de pago"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          El comprobante está listo. Puedes enviarlo por WhatsApp o descargarlo como imagen.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {/* Render Canvas preview */}
        <Box
          ref={canvasContainerRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            maxWidth: 340,
            mx: "auto",
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={sharing ? <CircularProgress size={18} color="inherit" /> : <WhatsAppIcon />}
          onClick={handleWhatsApp}
          disabled={sharing}
          sx={{
            backgroundColor: "#25D366",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#1EBE5D" },
            fontWeight: 700,
            py: 1.2,
          }}
        >
          Enviar por WhatsApp
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => downloadReceipt(data)}
          sx={{ py: 1 }}
        >
          Descargar imagen
        </Button>

        <Button fullWidth onClick={onClose} color="inherit" sx={{ mt: 0.5 }}>
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

