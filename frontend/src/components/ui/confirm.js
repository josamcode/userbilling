"use client";

import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  open,
  title = "تأكيد العملية",
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description ? (
        <p className="text-sm text-slate-600 leading-7">{description}</p>
      ) : null}
    </Modal>
  );
}
