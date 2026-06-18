"use client";

import { useState } from "react";
import type { WidgetProps, FieldTemplateProps, SubmitButtonProps } from "@rjsf/utils";
import { getSubmitButtonOptions } from "@rjsf/utils";
import { Input, Dropdown, Toggle, Button, DateInput } from "@sarunyu/system-one";

type SchemaExtra = {
  placeholder: string;
  unit: string | undefined;
  helperText: string | undefined;
  currencyPrefix: string | undefined; // e.g. "฿" — auto-prepended, stripped on display
  pctSuffix: boolean;                 // auto-appended "%", stripped on display
};

function getSchemaExtra(schema: WidgetProps["schema"], id: string): SchemaExtra {
  const raw = schema as Record<string, unknown>;
  const desc = String(schema.description ?? "");
  const example = raw.example;
  const exampleStr = example != null ? String(example) : "";
  const idLower = id.toLowerCase();
  const isNumeric = schema.type === "integer" || schema.type === "number";
  const isString = schema.type === "string";

  // Numeric % — value IS the number, just show unit
  const isPctNumeric =
    isNumeric &&
    (idLower.includes("pct") ||
      idLower.includes("percent") ||
      idLower.includes("ytd") ||
      idLower.includes("probability") ||
      desc.toLowerCase().includes("percentage") ||
      desc.toLowerCase().includes("percent"));

  // String % — user types number, system appends "%"
  const pctSuffix = isString && exampleStr.endsWith("%");

  // String ฿ — user types amount, system prepends "฿ "
  const isCurrencyString = isString && (exampleStr.startsWith("฿") || desc.includes("฿"));
  // Numeric ฿ — number field with THB currency (aum, dealSize)
  const isCurrencyNumeric = isNumeric && (desc.includes("฿") || desc.toLowerCase().includes("thb") || desc.toLowerCase().includes("millions thb"));
  const currencyPrefix = (isCurrencyString || isCurrencyNumeric) ? "฿" : undefined;

  const unit = isPctNumeric || pctSuffix ? "%" : undefined;

  const min = schema.minimum;
  const max = schema.maximum;
  const rangeHint = min != null && max != null ? ` (${min}–${max})` : "";
  const helperText = desc ? desc + rangeHint : rangeHint || undefined;

  // Placeholder shows the raw value the user types (without the auto-added symbol)
  let placeholder = "Text label";
  if (exampleStr) {
    if (isCurrencyString) placeholder = `e.g. ${exampleStr.replace(/^฿\s*/, "")}`;
    else if (pctSuffix) placeholder = `e.g. ${exampleStr.replace(/%$/, "")}`;
    else placeholder = `e.g. ${exampleStr}`;
  }

  return { placeholder, unit, helperText, currencyPrefix, pctSuffix };
}

function HelperText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-xs text-muted-foreground px-1 mt-1">{text}</p>;
}

function SignedPctInput({
  id, label, value, onChange, disabled, errorMsg, helperText,
}: {
  id: string; label: string; value: unknown;
  onChange: (v: number | undefined) => void; disabled?: boolean;
  errorMsg?: string; helperText?: string;
}) {
  const num = value != null && value !== "" ? Number(value) : undefined;
  const [isLoss, setIsLoss] = useState(num != null ? num < 0 : false);
  const absStr = num != null ? String(Math.abs(num)) : "";

  const toggle = (loss: boolean) => {
    setIsLoss(loss);
    if (num != null) onChange(loss ? -Math.abs(num) : Math.abs(num));
  };

  const btnBase = "px-3 py-1.5 text-xs font-semibold rounded-md transition-all shrink-0 cursor-pointer";
  const active = "bg-card text-foreground shadow-sm";
  const inactive = "text-muted-foreground hover:bg-card/60 hover:text-foreground";

  return (
    <div className="flex flex-col gap-1">
      {label && <p className="text-sm font-bold text-foreground px-0.5">{label}</p>}
      <div className={[
        "flex items-center rounded-lg border overflow-hidden bg-background",
        errorMsg ? "border-destructive" : "border-border",
        disabled ? "opacity-50" : "",
      ].join(" ")}>
        <div className="flex items-center gap-1 p-1.5 bg-muted border-r border-border shrink-0">
          <button type="button" disabled={disabled}
            className={`${btnBase} ${!isLoss ? active : inactive}`}
            onClick={() => toggle(false)}>
            +
          </button>
          <button type="button" disabled={disabled}
            className={`${btnBase} ${isLoss ? active : inactive}`}
            onClick={() => toggle(true)}>
            −
          </button>
        </div>
        <input
          id={id}
          type="number"
          min="0"
          step="any"
          value={absStr}
          placeholder="e.g. 12.4"
          disabled={disabled}
          onChange={(e) => {
            const abs = parseFloat(e.target.value);
            if (isNaN(abs)) onChange(undefined);
            else onChange(isLoss ? -abs : abs);
          }}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <span className="px-3 py-2.5 text-sm text-muted-foreground bg-muted border-l border-border shrink-0">%</span>
      </div>
      {errorMsg
        ? <p className="text-xs text-destructive px-1">{errorMsg}</p>
        : <HelperText text={helperText} />
      }
    </div>
  );
}

function AdornedInput({
  id, label, placeholder, rawValue, onChange, disabled, errorMsg, helperText, prefix, suffix,
}: {
  id: string; label: string; placeholder: string; rawValue: string;
  onChange: (v: string) => void; disabled?: boolean;
  errorMsg?: string; helperText?: string; prefix?: string; suffix?: string;
}) {
  const isError = !!errorMsg;
  const adornCls = "px-3 py-2.5 text-sm text-muted-foreground bg-muted shrink-0 select-none";
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className="text-sm font-bold text-foreground px-0.5">{label}</p>
      )}
      <div className={[
        "flex items-center rounded-lg border overflow-hidden bg-background transition-colors",
        isError ? "border-destructive" : "border-border",
        disabled ? "opacity-50" : "",
      ].join(" ")}>
        {prefix && <span className={`${adornCls} border-r border-border`}>{prefix}</span>}
        <input
          id={id}
          value={rawValue}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {suffix && <span className={`${adornCls} border-l border-border`}>{suffix}</span>}
      </div>
      {isError
        ? <p className="text-xs text-destructive px-1">{errorMsg}</p>
        : <HelperText text={helperText} />
      }
    </div>
  );
}

export function TextWidget({ id, value, label, required, disabled, onChange, rawErrors, schema, placeholder: uiPlaceholder }: WidgetProps) {
  const errorMsg = rawErrors?.[0];
  const { placeholder, unit, helperText, currencyPrefix, pctSuffix } = getSchemaExtra(schema, id);

  const fullLabel = required ? `${label} *` : label;
  const idLower = id.toLowerCase();
  const schemaDesc = String(schema.description ?? "").toLowerCase();
  const isPct = unit === "%" || idLower.includes("pct") || idLower.includes("ytd") || idLower.includes("probability");
  const isSignedPct = isPct && (idLower.includes("ytd") || schemaDesc.includes("loss") || schemaDesc.includes("negative"));

  if (isSignedPct) {
    return (
      <SignedPctInput
        id={id} label={fullLabel} value={value}
        onChange={onChange} disabled={disabled}
        errorMsg={errorMsg} helperText={helperText}
      />
    );
  }

  if (currencyPrefix) {
    const isNumericField = schema.type === "number" || schema.type === "integer";
    const raw = typeof value === "number" ? String(value) : String(value ?? "").replace(/^฿\s*/, "");
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={raw}
        onChange={(v) => {
          if (!v) { onChange(isNumericField ? undefined : ""); return; }
          onChange(isNumericField ? Number(v) : `฿ ${v}`);
        }}
        disabled={disabled} errorMsg={errorMsg} helperText={helperText} prefix="฿"
      />
    );
  }

  if (pctSuffix || isPct) {
    const raw = String(value ?? "").replace(/%$/, "");
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={raw} onChange={(v) => onChange(pctSuffix ? (v ? `${v}%` : "") : (v === "" ? undefined : Number(v)))}
        disabled={disabled} errorMsg={errorMsg} helperText={helperText} suffix="%"
      />
    );
  }

  return (
    <div>
      <Input
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        value={String(value ?? "")} onChange={onChange}
        disabled={disabled}
        forceState={errorMsg ? "error" : undefined} errorMessage={errorMsg}
      />
      {!errorMsg && <HelperText text={helperText} />}
    </div>
  );
}

export function NumberWidget({ id, value, label, required, disabled, onChange, rawErrors, schema, placeholder: uiPlaceholder }: WidgetProps) {
  const errorMsg = rawErrors?.[0];
  const { placeholder, unit, helperText, currencyPrefix } = getSchemaExtra(schema, id);
  const fullLabel = required ? `${label} *` : label;
  const rawValue = value != null ? String(value) : "";

  if (currencyPrefix) {
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={rawValue} onChange={(v) => onChange(v === "" ? undefined : Number(v))}
        disabled={disabled} errorMsg={errorMsg} helperText={helperText} prefix={currencyPrefix}
      />
    );
  }

  if (unit === "%" || id.toLowerCase().includes("pct") || id.toLowerCase().includes("ytd") || id.toLowerCase().includes("probability")) {
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={rawValue} onChange={(v) => onChange(v === "" ? undefined : Number(v))}
        disabled={disabled} errorMsg={errorMsg} helperText={helperText} suffix="%"
      />
    );
  }

  return (
    <div>
      <Input
        id={id}
        type="number"
        label={fullLabel}
        placeholder={uiPlaceholder || placeholder}
        value={rawValue}
        onChange={(v) => onChange(v === "" ? undefined : Number(v))}
        disabled={disabled}
        forceState={errorMsg ? "error" : undefined}
        errorMessage={errorMsg}
      />
      {!errorMsg && <HelperText text={helperText} />}
    </div>
  );
}

export function SelectWidget({ id, value, label, required, disabled, onChange, options, rawErrors, schema }: WidgetProps) {
  const errorMsg = rawErrors?.[0];
  const desc = String(schema.description ?? "");
  const dropdownOptions = (options.enumOptions ?? [])
    .filter((o) => o.value !== "")
    .map((o) => ({ label: String(o.label), value: String(o.value) }));

  return (
    <div>
      <Dropdown
        label={label}
        required={required}
        value={value ?? ""}
        onChange={onChange}
        options={dropdownOptions}
        forceState={disabled ? "disabled" : errorMsg ? "error" : undefined}
        errorMessage={errorMsg}
      />
      {!errorMsg && <HelperText text={desc} />}
    </div>
  );
}

export function ToggleWidget({ id, value, label, required, disabled, onChange, rawErrors, schema }: WidgetProps) {
  const errorMsg = rawErrors?.[0];
  const desc = String(schema.description ?? "");
  const fullLabel = required ? `${label} *` : label;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold text-foreground px-0.5">{fullLabel}</p>
      <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5">
        {desc && <span className="text-sm text-muted-foreground">{desc}</span>}
        <Toggle
          id={id}
          checked={!!value}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {errorMsg && <p className="text-xs text-destructive px-1">{errorMsg}</p>}
    </div>
  );
}

export function DateWidget({ value, label, required, disabled, onChange, rawErrors }: WidgetProps) {
  const errorMsg = rawErrors?.[0];
  const dateValue = value ? new Date(String(value)) : undefined;
  const fullLabel = required ? `${label} *` : label;

  return (
    <div className="flex flex-col gap-1">
      {fullLabel && <p className="text-sm font-bold text-foreground px-0.5">{fullLabel}</p>}
      <DateInput
        placeholder={fullLabel}
        value={dateValue}
        onChange={(d) => onChange(d ? d.toISOString().split("T")[0] : undefined)}
        forceState={disabled ? "disabled" : errorMsg ? "error" : undefined}
        errorMessage={errorMsg}
      />
    </div>
  );
}

export function FieldTemplate({ children, hidden }: FieldTemplateProps) {
  if (hidden) return null;
  return <div className="mb-4">{children}</div>;
}

export function SubmitButton({ uiSchema }: SubmitButtonProps) {
  const { submitText, norender, props: btnProps } = getSubmitButtonOptions(uiSchema);
  if (norender) return null;
  return (
    <div className="mt-4">
      <Button type="submit" variant="primary" disabled={!!btnProps?.disabled}>
        {submitText}
      </Button>
    </div>
  );
}

export const customWidgets = {
  TextWidget,
  SelectWidget,
  CheckboxWidget: ToggleWidget,
  UpDownWidget: NumberWidget,
  DateWidget,
};
