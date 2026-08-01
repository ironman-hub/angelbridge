"use client";

export function CheckboxGroup({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: number;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }
  return (
    <div className={`grid gap-2 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            type="button"
            key={opt}
            onClick={() => toggle(opt)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span
              className={`grid h-5 w-5 flex-none place-items-center rounded-md border text-xs ${
                active ? "border-brand-500 bg-brand-600 text-white" : "border-slate-300"
              }`}
            >
              {active ? "✓" : ""}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
