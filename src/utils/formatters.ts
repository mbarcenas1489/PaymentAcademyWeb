import { PaymentMethod, PaymentType, MemberStatus, PaymentCurrency } from "@/types";

const numberFormatter = new Intl.NumberFormat("es-NI", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const getCurrencySymbol = (
  currency?: PaymentCurrency | string | null
): string => {
  return currency === "USD" ? "$" : "C$";
};

export const getCurrencyLabel = (
  currency?: PaymentCurrency | string | null
): string => {
  return currency === "USD" ? "Dólares ($)" : "Córdobas (C$)";
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency: PaymentCurrency | string | null | undefined = "NIO"
): string => {
  const prefix = getCurrencySymbol(currency);
  if (amount == null || isNaN(amount)) return `${prefix} 0`;
  return `${prefix} ${numberFormatter.format(amount)}`;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? dateString
      : d.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (date: Date = new Date()): string => {
  const formatted = date.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const getPaymentMethodLabel = (method: PaymentMethod | string | null | undefined): string => {
  switch (method) {
    case "cash":
      return "Efectivo";
    case "card":
      return "Tarjeta";
    case "transfer":
      return "Transferencia";
    case "online":
      return "Pago en línea";
    default:
      return "Otro";
  }
};

export const getPaymentTypeLabel = (type: PaymentType | string | null | undefined): string => {
  switch (type) {
    case "monthly_fee":
      return "Mensualidad";
    case "enrollment":
      return "Matrícula o inscripción";
    case "class_package":
      return "Paquete de clases";
    case "personal_training":
      return "Entrenamiento personal";
    default:
      return "Otro concepto";
  }
};

export const getMemberStatusLabel = (status: MemberStatus | string | null | undefined): string => {
  switch (status) {
    case "active":
      return "Activo";
    case "frozen":
      return "Congelado";
    default:
      return "Inactivo";
  }
};

export type ValidityStatus = "current" | "upcoming" | "expired";

export const getPaymentValidityStatus = (
  validFrom: string | null | undefined,
  validUntil: string | null | undefined
): { status: ValidityStatus; label: string } => {
  if (!validFrom || !validUntil) {
    return { status: "expired", label: "Sin vigencia" };
  }

  const today = new Date().toISOString().split("T")[0];

  if (today < validFrom) {
    return { status: "upcoming", label: "Próximo" };
  }
  if (today > validUntil) {
    return { status: "expired", label: "Vencido" };
  }
  return { status: "current", label: "Vigente" };
};

export const addOneMonth = (dateStr: string): string => {
  try {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  } catch {
    return dateStr;
  }
};

