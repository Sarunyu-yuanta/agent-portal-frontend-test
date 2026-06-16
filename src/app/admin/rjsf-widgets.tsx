"use client";

import type { WidgetProps, FieldTemplateProps } from "@rjsf/utils";

const inputCls =
  "w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground outline-none transition-colors " +
  "focus:border-primary focus:ring-2 focus:ring-primary/15 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

function FieldLabel({ id, label, required }: { id: string; label: string; required?: boolean }) {
  if (!label) return null;
  return (
    <label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

export function TextWidget({ id, value, label, required, disabled, onChange, rawErrors }: WidgetProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <input
        id={id}
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputCls + (rawErrors?.length ? " border-destructive" : "")}
      />
      {rawErrors?.map((e, i) => <p key={i} className="text-xs text-destructive">{e}</p>)}
    </div>
  );
}

export function NumberWidget({ id, value, label, required, disabled, onChange, rawErrors }: WidgetProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <input
        id={id}
        type="number"
        value={value != null ? String(value) : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        disabled={disabled}
        className={inputCls + (rawErrors?.length ? " border-destructive" : "")}
      />
      {rawErrors?.map((e, i) => <p key={i} className="text-xs text-destructive">{e}</p>)}
    </div>
  );
}

export function SelectWidget({ id, value, label, required, disabled, onChange, options, rawErrors }: WidgetProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={
            "w-full appearance-none border border-border rounded-xl px-4 py-3 pr-10 text-sm bg-background text-foreground outline-none transition-colors " +
            "focus:border-primary focus:ring-2 focus:ring-primary/15 " +
            "disabled:opacity-50 disabled:cursor-not-allowed " +
            (rawErrors?.length ? "border-destructive " : "")
          }
        >
          <option value="">Select…</option>
          {(options.enumOptions ?? [])
            .filter((o) => o.value !== "")
            .map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {String(o.label)}
              </option>
            ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {rawErrors?.map((e, i) => <p key={i} className="text-xs text-destructive">{e}</p>)}
    </div>
  );
}

export function ToggleWidget({ id, value, label, required, disabled, onChange, rawErrors }: WidgetProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <label className="flex items-center gap-2 cursor-pointer">
        <button
          id={id}
          role="switch"
          type="button"
          aria-checked={!!value}
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={
            "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 " +
            (value ? "bg-primary" : "bg-muted") +
            (disabled ? " opacity-50 cursor-not-allowed" : "")
          }
        >
          <span
            className={
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " +
              (value ? "translate-x-4" : "translate-x-0")
            }
          />
        </button>
        <span className="text-sm text-foreground">{value ? "True" : "False"}</span>
      </label>
      {rawErrors?.map((e, i) => <p key={i} className="text-xs text-destructive">{e}</p>)}
    </div>
  );
}

export function FieldTemplate({ children, hidden }: FieldTemplateProps) {
  if (hidden) return null;
  return <div className="mb-4">{children}</div>;
}

export const customWidgets = {
  TextWidget,
  SelectWidget,
  CheckboxWidget: ToggleWidget,
  UpDownWidget: NumberWidget,
};
