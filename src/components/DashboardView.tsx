"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "./Navbar";
import SummaryTab from "./SummaryTab";
import MovementsTab from "./MovementsTab";
import MembersDialog from "./MembersDialog";
import RegisterMemberDialog from "./RegisterMemberDialog";
import PaymentFormDialog from "./PaymentFormDialog";
import InstallmentDialog from "./InstallmentDialog";
import ReceiptModal from "./ReceiptModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import EditMemberTariffDialog from "./EditMemberTariffDialog";
import EditMemberDialog from "./EditMemberDialog";
import ConfirmDeleteMemberDialog from "./ConfirmDeleteMemberDialog";

import { useOrganization } from "@/hooks/useOrganization";
import { useMemberSummaries } from "@/hooks/useMemberSummaries";
import { useMembers } from "@/hooks/useMembers";
import { usePayments } from "@/hooks/usePayments";
import { useAppConfiguration } from "@/hooks/useAppConfiguration";
import { useMemberConfigurations } from "@/hooks/useMemberConfigurations";
import {
  Member,
  MemberPaymentSummary,
  PaymentSummary,
  PaymentDraft,
  PaymentReceiptData,
  InstallmentInput,
  MemberCustomPricing,
  UpdateMemberInput,
} from "@/types";
import { User } from "@supabase/supabase-js";
import { getPaymentTypeLabel, getPaymentMethodLabel } from "@/utils/formatters";

interface DashboardViewProps {
  user: User;
  onSignOut: () => void;
}

export default function DashboardView({ user, onSignOut }: DashboardViewProps) {
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Modals state
  const [openMembersDialog, setOpenMembersDialog] = useState<boolean>(false);
  const [openRegisterMember, setOpenRegisterMember] = useState<boolean>(false);
  const [openPaymentForm, setOpenPaymentForm] = useState<boolean>(false);
  const [openInstallmentDialog, setOpenInstallmentDialog] = useState<boolean>(false);
  const [openReceiptModal, setOpenReceiptModal] = useState<boolean>(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState<boolean>(false);
  const [openEditTariffDialog, setOpenEditTariffDialog] = useState<boolean>(false);
  const [openEditMemberDialog, setOpenEditMemberDialog] = useState<boolean>(false);
  const [openDeleteMemberDialog, setOpenDeleteMemberDialog] = useState<boolean>(false);

  // Form selections
  const [targetMember, setTargetMember] = useState<Member | null>(null);
  const [tariffMemberTarget, setTariffMemberTarget] = useState<Member | null>(null);
  const [editingMemberTarget, setEditingMemberTarget] = useState<Member | null>(null);
  const [deletingMemberTarget, setDeletingMemberTarget] = useState<Member | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentSummary | null>(null);
  const [installmentTarget, setInstallmentTarget] = useState<PaymentSummary | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentSummary | null>(null);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [isReceiptNew, setIsReceiptNew] = useState<boolean>(false);

  // Filter state for member payments
  const [filteredMemberName, setFilteredMemberName] = useState<string | null>(null);

  // Feedback notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Custom Hooks
  const {
    organizationId,
    role,
    canManagePayments,
    loading: orgLoading,
    error: orgError,
    refreshOrganization,
  } = useOrganization(user);

  const {
    filteredSummaries,
    searchQuery: summarySearch,
    setSearchQuery: setSummarySearch,
    loading: summariesLoading,
    error: summaryError,
    refreshSummaries,
  } = useMemberSummaries(organizationId);

  const {
    members,
    filteredMembers,
    searchQuery: memberSearch,
    setSearchQuery: setMemberSearch,
    loading: membersLoading,
    saving: memberSaving,
    error: memberError,
    createMember,
    updateMember,
    deleteMember,
    refreshMembers,
  } = useMembers(organizationId);

  const {
    payments,
    loading: paymentsLoading,
    saving: paymentSaving,
    error: paymentError,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    setSelectedMemberId,
    monthlyTotalNIO,
    monthlyTotalUSD,
    createPayment,
    updatePayment,
    registerInstallment,
    deletePayment,
    refreshPayments,
  } = usePayments(organizationId);

  const {
    paymentSetting,
    refreshConfiguration,
  } = useAppConfiguration();

  const {
    memberPricingMap,
    saving: tariffSaving,
    saveMemberPricing,
    removeMemberPricing,
    refreshMemberConfigurations,
  } = useMemberConfigurations(organizationId);

  const handleRefreshAll = () => {
    refreshOrganization();
    refreshSummaries();
    refreshMembers();
    refreshPayments();
    refreshConfiguration();
    refreshMemberConfigurations();
    setSnackbar({
      open: true,
      message: "Datos actualizados correctamente.",
      severity: "info",
    });
  };

  const handleOpenEditTariff = (member: Member) => {
    setTariffMemberTarget(member);
    setOpenEditTariffDialog(true);
  };

  const handleSaveMemberTariff = async (
    memberId: string,
    pricing: MemberCustomPricing
  ): Promise<boolean> => {
    const ok = await saveMemberPricing(memberId, pricing);
    if (ok) {
      setSnackbar({
        open: true,
        message: "Tarifa personalizada actualizada.",
        severity: "success",
      });
    }
    return ok;
  };

  const handleRemoveMemberTariff = async (memberId: string): Promise<boolean> => {
    const ok = await removeMemberPricing(memberId);
    if (ok) {
      setSnackbar({
        open: true,
        message: "Se restableció a la tarifa global.",
        severity: "info",
      });
    }
    return ok;
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMemberTarget(member);
    setOpenEditMemberDialog(true);
  };

  const handleOpenEditMemberFromSummary = (summary: MemberPaymentSummary) => {
    const found = members.find((m) => m.id === summary.memberId);
    if (found) {
      setEditingMemberTarget(found);
      setOpenEditMemberDialog(true);
    }
  };

  const handleSaveEditMember = async (
    memberId: string,
    input: UpdateMemberInput
  ): Promise<boolean> => {
    const ok = await updateMember(memberId, input);
    if (ok) {
      setSnackbar({
        open: true,
        message: "Datos del miembro actualizados correctamente.",
        severity: "success",
      });
      refreshSummaries();
    }
    return ok;
  };

  const handleOpenDeleteMember = (member: Member) => {
    setDeletingMemberTarget(member);
    setOpenDeleteMemberDialog(true);
  };

  const handleConfirmDeleteMember = async () => {
    if (!deletingMemberTarget) return;
    const ok = await deleteMember(deletingMemberTarget.id);
    if (ok) {
      setSnackbar({
        open: true,
        message: "Miembro eliminado correctamente.",
        severity: "success",
      });
      refreshSummaries();
      refreshPayments();
      refreshMemberConfigurations();
      setOpenDeleteMemberDialog(false);
      setDeletingMemberTarget(null);
    }
  };

  // Handlers for Member summary actions
  const handleSelectMemberPayments = (summary: MemberPaymentSummary) => {
    setSelectedMemberId(summary.memberId);
    setFilteredMemberName(summary.fullName);
    setCurrentTab(1); // Switch to Movements Tab
  };

  const handleNewPaymentForSummary = (summary: MemberPaymentSummary) => {
    const mem = members.find((m) => m.id === summary.memberId) || {
      id: summary.memberId,
      organization_id: summary.organizationId,
      full_name: summary.fullName,
      document_number: summary.documentNumber,
      email: summary.email,
      phone: summary.phone,
      status: summary.memberStatus,
      joined_on: "",
      notes: null,
      created_at: "",
      updated_at: "",
    };
    setTargetMember(mem);
    setEditingPayment(null);
    setOpenPaymentForm(true);
  };

  const handleNewPaymentForMember = (member: Member) => {
    setTargetMember(member);
    setEditingPayment(null);
    setOpenPaymentForm(true);
  };

  const handleEditPayment = (payment: PaymentSummary) => {
    setEditingPayment(payment);
    const mem = members.find((m) => m.id === payment.member_id) || null;
    setTargetMember(mem);
    setOpenPaymentForm(true);
  };

  const handleOpenNewPaymentGeneral = () => {
    setTargetMember(null);
    setEditingPayment(null);
    setOpenPaymentForm(true);
  };

  const handleClearMemberFilter = () => {
    setSelectedMemberId(null);
    setFilteredMemberName(null);
  };

  const handleShareReceipt = (payment: PaymentSummary) => {
    const paid = Number(payment.amount || 0);
    const pending = Number(payment.pending_amount || 0);
    setReceiptData({
      memberName: payment.memberName,
      amount: paid,
      pendingAmount: pending,
      totalPeriodAmount: paid + pending,
      currency: payment.currency || "NIO",
      paidOn: payment.paid_on,
      paymentType: getPaymentTypeLabel(payment.payment_type),
      paymentMethod: getPaymentMethodLabel(payment.payment_method),
      validFrom: payment.valid_from,
      validUntil: payment.valid_until,
      reference: payment.reference,
      receiptNumber: payment.id,
      memberDocument: payment.memberDocument,
    });
    setIsReceiptNew(false);
    setOpenReceiptModal(true);
  };

  const handleOpenInstallmentForPayment = (payment: PaymentSummary) => {
    setInstallmentTarget(payment);
    setOpenInstallmentDialog(true);
  };

  const handleOpenInstallmentForSummary = (summary: MemberPaymentSummary) => {
    if (!summary.lastPaymentId) return;
    const found = payments.find((p) => p.id === summary.lastPaymentId);
    if (found) {
      setInstallmentTarget(found);
      setOpenInstallmentDialog(true);
      return;
    }
    // Fallback constructed from summary if payments list was filtered
    const fallbackPayment: PaymentSummary = {
      id: summary.lastPaymentId,
      organization_id: summary.organizationId,
      member_id: summary.memberId,
      amount: Number(summary.lastAmount || 0),
      pending_amount: Number(summary.lastPendingAmount || 0),
      currency: summary.lastCurrency || "NIO",
      payment_type: summary.lastPaymentType || "monthly_fee",
      payment_method: summary.lastPaymentMethod || "cash",
      paid_on: summary.lastPaidOn || new Date().toISOString().split("T")[0],
      valid_from: summary.lastValidFrom || new Date().toISOString().split("T")[0],
      valid_until: summary.lastValidUntil || new Date().toISOString().split("T")[0],
      reference: null,
      notes: null,
      created_at: "",
      memberName: summary.fullName,
      memberDocument: summary.documentNumber,
    };
    setInstallmentTarget(fallbackPayment);
    setOpenInstallmentDialog(true);
  };

  const handleSaveInstallment = async (
    payment: PaymentSummary,
    input: InstallmentInput
  ): Promise<boolean> => {
    const updated = await registerInstallment(payment, input);
    if (updated) {
      const remaining = Number(updated.pending_amount || 0);
      const totalPaid = Number(updated.amount || 0);
      setSnackbar({
        open: true,
        message:
          remaining === 0
            ? "¡Abono registrado! El saldo pendiente ha quedado saldado."
            : "Abono registrado correctamente.",
        severity: "success",
      });
      refreshSummaries();

      setReceiptData({
        memberName: updated.memberName,
        amount: totalPaid,
        pendingAmount: remaining,
        totalPeriodAmount: totalPaid + remaining,
        currency: updated.currency || "NIO",
        paidOn: updated.paid_on,
        paymentType: getPaymentTypeLabel(updated.payment_type),
        paymentMethod: getPaymentMethodLabel(updated.payment_method),
        validFrom: updated.valid_from,
        validUntil: updated.valid_until,
        reference: updated.reference,
        receiptNumber: updated.id,
        memberDocument: updated.memberDocument,
      });
      setIsReceiptNew(true);
      setOpenReceiptModal(true);
      return true;
    }
    return false;
  };

  const handleSavePayment = async (
    draft: PaymentDraft,
    paymentId?: string
  ): Promise<string | null> => {
    if (paymentId) {
      const ok = await updatePayment(paymentId, draft);
      if (ok) {
        setSnackbar({
          open: true,
          message: "Pago actualizado correctamente.",
          severity: "success",
        });
        refreshSummaries();
        return paymentId;
      }
      return null;
    } else {
      const newId = await createPayment(draft);
      if (newId) {
        const pending = Number(draft.pendingAmount || 0);
        setSnackbar({
          open: true,
          message:
            pending > 0
              ? "Abono parcial guardado correctamente."
              : "Pago guardado correctamente.",
          severity: "success",
        });
        refreshSummaries();

        // Show receipt modal immediately
        const mem = members.find((m) => m.id === draft.memberId);
        setReceiptData({
          memberName: mem?.full_name || "Miembro",
          amount: draft.amount,
          pendingAmount: pending,
          totalPeriodAmount: draft.amount + pending,
          currency: draft.currency || "NIO",
          paidOn: draft.paidOn,
          paymentType: getPaymentTypeLabel(draft.paymentType),
          paymentMethod: getPaymentMethodLabel(draft.paymentMethod),
          validFrom: draft.validFrom,
          validUntil: draft.validUntil,
          reference: draft.reference,
          receiptNumber: newId,
          memberDocument: mem?.document_number,
        });
        setIsReceiptNew(true);
        setOpenReceiptModal(true);
        return newId;
      }
      return null;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPayment) return;
    const ok = await deletePayment(deletingPayment.id);
    if (ok) {
      setSnackbar({
        open: true,
        message: "Pago eliminado correctamente.",
        severity: "success",
      });
      refreshSummaries();
      setOpenConfirmDelete(false);
      setDeletingPayment(null);
    }
  };

  // Global errors
  const activeError = orgError || summaryError || memberError || paymentError;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 8 }}>
      <Navbar
        userEmail={user.email ?? null}
        role={role}
        onOpenMembers={() => setOpenMembersDialog(true)}
        onOpenNewPayment={handleOpenNewPaymentGeneral}
        onRefresh={handleRefreshAll}
        onSignOut={onSignOut}
        loading={orgLoading || summariesLoading || paymentsLoading}
      />

      <Container maxWidth="md" sx={{ mt: 3 }}>
        {activeError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {activeError}
          </Alert>
        )}

        {/* Dashboard Tabs */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
            backgroundColor: "background.paper",
            borderRadius: 3,
            px: 2,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_e, v) => setCurrentTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Resumen" sx={{ fontWeight: 700, fontSize: "0.95rem" }} />
            <Tab label="Movimientos" sx={{ fontWeight: 700, fontSize: "0.95rem" }} />
          </Tabs>
        </Box>

        {/* TAB CONTENT */}
        {currentTab === 0 ? (
          <SummaryTab
            summaries={filteredSummaries}
            searchQuery={summarySearch}
            onSearchChange={setSummarySearch}
            monthlyTotalNIO={monthlyTotalNIO}
            monthlyTotalUSD={monthlyTotalUSD}
            loading={summariesLoading}
            onSelectMemberPayments={handleSelectMemberPayments}
            onNewPaymentForMember={handleNewPaymentForSummary}
            onInstallmentForMember={
              canManagePayments ? handleOpenInstallmentForSummary : undefined
            }
            onOpenNewMember={() => setOpenRegisterMember(true)}
            onEditMember={handleOpenEditMemberFromSummary}
          />
        ) : (
          <MovementsTab
            payments={payments}
            fromDate={fromDate}
            toDate={toDate}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onApplyFilter={refreshPayments}
            loading={paymentsLoading}
            canManagePayments={canManagePayments}
            selectedMemberName={filteredMemberName}
            onClearMemberFilter={handleClearMemberFilter}
            onEditPayment={handleEditPayment}
            onDeletePayment={(p) => {
              setDeletingPayment(p);
              setOpenConfirmDelete(true);
            }}
            onShareReceipt={handleShareReceipt}
            onRegisterInstallment={handleOpenInstallmentForPayment}
            onOpenNewPayment={handleOpenNewPaymentGeneral}
          />
        )}
      </Container>

      {/* Floating Action Button for New Payment */}
      <Tooltip title="Nuevo pago">
        <Fab
          color="primary"
          aria-label="add payment"
          onClick={handleOpenNewPaymentGeneral}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* DIALOGS */}
      <MembersDialog
        open={openMembersDialog}
        onClose={() => setOpenMembersDialog(false)}
        members={filteredMembers}
        searchQuery={memberSearch}
        onSearchChange={setMemberSearch}
        loading={membersLoading}
        memberPricingMap={memberPricingMap}
        onEditMemberTariff={handleOpenEditTariff}
        onEditMember={handleOpenEditMember}
        onDeleteMember={handleOpenDeleteMember}
        onOpenRegisterMember={() => {
          setOpenMembersDialog(false);
          setOpenRegisterMember(true);
        }}
        onViewMemberPayments={(m) => {
          setSelectedMemberId(m.id);
          setFilteredMemberName(m.full_name);
          setCurrentTab(1);
        }}
        onNewPaymentForMember={handleNewPaymentForMember}
      />

      <RegisterMemberDialog
        open={openRegisterMember}
        onClose={() => setOpenRegisterMember(false)}
        defaultPaymentSetting={paymentSetting}
        onSave={async (input) => {
          const res = await createMember(input);
          if (res) {
            setSnackbar({
              open: true,
              message: "Miembro registrado correctamente.",
              severity: "success",
            });
            refreshSummaries();
            refreshMemberConfigurations();
          }
          return res;
        }}
        saving={memberSaving}
      />

      <PaymentFormDialog
        open={openPaymentForm}
        onClose={() => setOpenPaymentForm(false)}
        members={members}
        initialMember={targetMember}
        editingPayment={editingPayment}
        paymentSetting={paymentSetting}
        memberPricingMap={memberPricingMap}
        onSave={handleSavePayment}
        saving={paymentSaving}
      />

      <EditMemberTariffDialog
        open={openEditTariffDialog}
        onClose={() => setOpenEditTariffDialog(false)}
        member={tariffMemberTarget}
        currentPricing={tariffMemberTarget ? memberPricingMap.get(tariffMemberTarget.id) || null : null}
        defaultPaymentSetting={paymentSetting}
        onSave={handleSaveMemberTariff}
        onRemove={handleRemoveMemberTariff}
        saving={tariffSaving}
      />

      <InstallmentDialog
        open={openInstallmentDialog}
        onClose={() => setOpenInstallmentDialog(false)}
        payment={installmentTarget}
        onSave={handleSaveInstallment}
        saving={paymentSaving}
      />

      <ReceiptModal
        open={openReceiptModal}
        onClose={() => setOpenReceiptModal(false)}
        data={receiptData}
        isNewPayment={isReceiptNew}
      />

      <ConfirmDeleteDialog
        open={openConfirmDelete}
        memberName={deletingPayment?.memberName}
        onClose={() => setOpenConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        loading={paymentSaving}
      />

      <EditMemberDialog
        open={openEditMemberDialog}
        onClose={() => setOpenEditMemberDialog(false)}
        member={editingMemberTarget}
        onSave={handleSaveEditMember}
        saving={memberSaving}
      />

      <ConfirmDeleteMemberDialog
        open={openDeleteMemberDialog}
        member={deletingMemberTarget}
        onClose={() => setOpenDeleteMemberDialog(false)}
        onConfirm={handleConfirmDeleteMember}
        loading={memberSaving}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 3, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

