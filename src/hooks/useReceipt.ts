"use client";

import { useCallback } from "react";
import { PaymentReceiptData } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

export function useReceipt() {
  const drawReceiptCanvas = useCallback(
    (data: PaymentReceiptData): HTMLCanvasElement => {
      const width = 1080;
      const height = 1880;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return canvas;

      // Background
      ctx.fillStyle = "#F0FDF4";
      ctx.fillRect(0, 0, width, height);

      // Top banner
      ctx.fillStyle = "#0F766E";
      ctx.fillRect(0, 0, width, 260);

      // Icon circle
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(110, 104, 54, 0, 2 * Math.PI);
      ctx.fill();

      // Checkmark icon
      ctx.strokeStyle = "#0F766E";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(78, 105);
      ctx.lineTo(101, 129);
      ctx.lineTo(145, 79);
      ctx.stroke();

      // Header text
      ctx.textAlign = "left";
      ctx.font = "bold 40px system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("Payment Academy", 190, 100);

      ctx.font = "bold 48px system-ui, sans-serif";
      ctx.fillText("COMPROBANTE DE PAGO", 190, 157);

      ctx.font = "28px system-ui, sans-serif";
      ctx.fillStyle = "#CCFBF1";
      ctx.fillText("Pago recibido correctamente", 190, 207);

      if (data.receiptNumber) {
        ctx.textAlign = "right";
        ctx.font = "bold 24px monospace, sans-serif";
        ctx.fillStyle = "#CCFBF1";
        ctx.fillText(`N.º ${data.receiptNumber.slice(0, 8).toUpperCase()}`, 970, 235);
      }

      // White card container
      ctx.fillStyle = "#FFFFFF";
      const cardX = 56;
      const cardY = 304;
      const cardW = 968;
      const cardH = 1466;
      const radius = 32;

      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardW - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
      ctx.lineTo(cardX + cardW, cardY + cardH - radius);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
      ctx.lineTo(cardX + radius, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.fill();

      // TOTAL PAGADO / TOTAL ABONADO
      const isPartial = (data.pendingAmount ?? 0) > 0;
      const totalPeriodAmount =
        data.totalPeriodAmount ?? (data.amount || 0) + (data.pendingAmount || 0);

      ctx.textAlign = "center";
      ctx.font = "bold 27px system-ui, sans-serif";
      ctx.fillStyle = "#4A6B63";
      ctx.fillText(isPartial ? "TOTAL ABONADO" : "TOTAL PAGADO", 540, 395);

      // Amount
      ctx.font = "bold 67px system-ui, sans-serif";
      ctx.fillStyle = "#0F2F28";
      ctx.fillText(formatCurrency(data.amount), 540, 480);

      // Confirmation / Partial pill
      ctx.fillStyle = isPartial ? "#FEF3C7" : "#D1FAE5";
      const pillX = 390;
      const pillY = 515;
      const pillW = 300;
      const pillH = 60;
      const pillR = 30;

      ctx.beginPath();
      ctx.moveTo(pillX + pillR, pillY);
      ctx.lineTo(pillX + pillW - pillR, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + pillR);
      ctx.lineTo(pillX + pillW, pillY + pillH - pillR);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - pillR, pillY + pillH);
      ctx.lineTo(pillX + pillR, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR);
      ctx.lineTo(pillX, pillY + pillR);
      ctx.quadraticCurveTo(pillX, pillY, pillX + pillR, pillY);
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 23px system-ui, sans-serif";
      ctx.fillStyle = isPartial ? "#B45309" : "#065F46";
      ctx.fillText(isPartial ? "ABONO PARCIAL" : "PAGO CONFIRMADO", 540, 555);

      // Divider line
      ctx.strokeStyle = "#E6F4F1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(105, 625);
      ctx.lineTo(975, 625);
      ctx.stroke();

      // Rows
      ctx.textAlign = "left";
      let y = 690;
      const rowStep = isPartial ? 98 : 112;

      const drawRow = (label: string, value: string, valueColor = "#0F2F28") => {
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillStyle = "#4A6B63";
        ctx.fillText(label, 115, y);

        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillStyle = valueColor;
        ctx.fillText(value, 115, y + 44);
        y += rowStep;
      };

      drawRow("RECIBIDO DE", data.memberName);
      if (data.memberDocument) {
        drawRow("DOCUMENTO", data.memberDocument);
      }
      drawRow("CONCEPTO", data.paymentType);
      if (isPartial) {
        drawRow("VALOR TOTAL DEL PERÍODO", formatCurrency(totalPeriodAmount));
        drawRow("SALDO PENDIENTE", formatCurrency(data.pendingAmount), "#B45309");
      }
      drawRow("MÉTODO", data.paymentMethod);
      drawRow("FECHA DE PAGO", formatDate(data.paidOn));
      drawRow("VIGENCIA", `${formatDate(data.validFrom)} – ${formatDate(data.validUntil)}`);

      if (data.reference) {
        drawRow("REFERENCIA", data.reference);
      }

      // Footer
      ctx.textAlign = "center";
      ctx.font = "27px system-ui, sans-serif";
      ctx.fillStyle = "#4A6B63";
      ctx.fillText("Gracias por tu pago", 540, 1815);

      ctx.font = "20px system-ui, sans-serif";
      ctx.fillText(`Generado: ${new Date().toLocaleString("es-CO")}`, 540, 1850);

      return canvas;
    },
    []
  );

  const downloadReceipt = useCallback(
    (data: PaymentReceiptData) => {
      const canvas = drawReceiptCanvas(data);
      const link = document.createElement("a");
      link.download = `comprobante_pago_${data.memberName.replace(/\s+/g, "_")}_${data.paidOn}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    [drawReceiptCanvas]
  );

  const shareViaWhatsApp = useCallback(
    async (data: PaymentReceiptData) => {
      const isPartial = (data.pendingAmount ?? 0) > 0;
      const totalPeriodAmount =
        data.totalPeriodAmount ?? (data.amount || 0) + (data.pendingAmount || 0);

      const message = `*Comprobante de Pago - Payment Academy*
👤 *Miembro:* ${data.memberName}
💰 *${isPartial ? "Total Abonado" : "Total Pagado"}:* ${formatCurrency(data.amount)}${
        isPartial
          ? `\n📊 *Valor Total:* ${formatCurrency(totalPeriodAmount)}\n⚠️ *Saldo Pendiente:* ${formatCurrency(data.pendingAmount)}\n🏷 *Estado:* Abono Parcial`
          : "\n✅ *Estado:* Pago Completo"
      }
📅 *Fecha:* ${formatDate(data.paidOn)}
📌 *Concepto:* ${data.paymentType}
💳 *Método:* ${data.paymentMethod}
🗓 *Vigencia:* ${formatDate(data.validFrom)} al ${formatDate(data.validUntil)}${
        data.reference ? `\n🔖 *Referencia:* ${data.reference}` : ""
      }${data.receiptNumber ? `\n🔢 *Recibo:* N.º ${data.receiptNumber.slice(0, 8).toUpperCase()}` : ""}`;

      const canvas = drawReceiptCanvas(data);

      // Check if Web Share API with files is available
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare
      ) {
        try {
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          if (blob) {
            const file = new File([blob], "comprobante_pago.png", {
              type: "image/png",
            });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: "Comprobante de pago",
                text: message,
                files: [file],
              });
              return;
            }
          }
        } catch {
          // If user cancels or not allowed, fallback to whatsapp web url
        }
      }

      // Fallback: Open WhatsApp with pre-filled message text
      const encoded = encodeURIComponent(message);
      const url = `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, "_blank");
    },
    [drawReceiptCanvas]
  );

  return {
    drawReceiptCanvas,
    downloadReceipt,
    shareViaWhatsApp,
  };
}

