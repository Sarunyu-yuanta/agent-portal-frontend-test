"use client";

import { useRef } from "react";
import { Button, Modal } from "@sarunyu/system-one";
import { Loader2 } from "lucide-react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { customWidgets, FieldTemplate, SubmitButton } from "./rjsf-widgets";
import type { ApiItem, Resource } from "./admin-utils";

export type RecordFormMode = "add" | "edit";

export function RecordFormModal({
  active,
  mode,
  initialData,
  saving,
  onClose,
  onSubmit,
}: {
  active: Resource;
  mode: RecordFormMode;
  initialData?: ApiItem;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: { formData?: Record<string, unknown> }) => void;
}) {
  const formRef = useRef<Form>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal
        variant="content"
        title={`${mode === "add" ? "Add" : "Edit"} ${active.name}`}
        className="w-[560px] max-w-[95vw]"
        actionLayout="none"
        onClose={onClose}
      >
        <div className="overflow-y-auto max-h-[60vh] pr-1 pl-px py-px">
          <Form
            ref={formRef}
            schema={active.schema}
            validator={validator}
            formData={initialData as Record<string, unknown>}
            onSubmit={onSubmit}
            disabled={saving}
            showErrorList={false}
            widgets={customWidgets}
            templates={{ FieldTemplate, ButtonTemplates: { SubmitButton } }}
            uiSchema={{
              "ui:submitButtonOptions": { norender: true },
            }}
          />
        </div>
        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => formRef.current?.submit()}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Saving…
              </>
            ) : mode === "add" ? (
              "Create Record"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
