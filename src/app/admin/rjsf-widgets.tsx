"use client";

import type { WidgetProps, FieldTemplateProps, SubmitButtonProps } from "@rjsf/utils";
import { getSubmitButtonOptions } from "@rjsf/utils";
import { Input, Dropdown, Toggle, Button } from "@sarunyu/system-one";

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
    (idLower.endsWith("pct") ||
      idLower.endsWith("percent") ||
      desc.toLowerCase().includes("percentage"));

  // String % — user types number, system appends "%"
  const pctSuffix = isString && exampleStr.endsWith("%");

  // String ฿ — user types amount, system prepends "฿ "
  const isCurrencyString = isString && (exampleStr.startsWith("฿") || desc.includes("฿"));
  const currencyPrefix = isCurrencyString ? "฿" : undefined;

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

  if (currencyPrefix) {
    const raw = String(value ?? "").replace(/^฿\s*/, "");
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={raw} onChange={(v) => onChange(v ? `฿ ${v}` : "")}
        disabled={disabled} errorMsg={errorMsg} helperText={helperText} prefix="฿"
      />
    );
  }

  if (pctSuffix) {
    const raw = String(value ?? "").replace(/%$/, "");
    return (
      <AdornedInput
        id={id} label={fullLabel} placeholder={uiPlaceholder || placeholder}
        rawValue={raw} onChange={(v) => onChange(v ? `${v}%` : "")}
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
  const { placeholder, unit, helperText } = getSchemaExtra(schema, id);
  return (
    <div>
      <Input
        id={id}
        type="number"
        label={required ? `${label} *` : label}
        placeholder={uiPlaceholder || placeholder}
        value={value != null ? String(value) : ""}
        onChange={(v) => onChange(v === "" ? undefined : Number(v))}
        disabled={disabled}
        unit={unit}
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
};
