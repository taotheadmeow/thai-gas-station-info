type FuelStatusSelectorProps = {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
};

type FuelValue = "null" | "false" | "true";

export default function FuelStatusSelector({
  label,
  value,
  onChange
}: FuelStatusSelectorProps) {
  const selected: FuelValue =
    value === null ? "null" : value === false ? "false" : "true";

  function handleChange(next: FuelValue) {
    if (next === "null") onChange(null);
    else if (next === "false") onChange(false);
    else onChange(true);
  }

  const options: Array<{ value: FuelValue; text: string; className: string }> = [
    {
      value: "null",
      text: "Not sold",
      className: "border-slate-200 bg-slate-50 text-slate-700"
    },
    {
      value: "false",
      text: "Empty",
      className: "border-amber-200 bg-amber-50 text-amber-700"
    },
    {
      value: "true",
      text: "Ready",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="mb-2 text-sm font-medium text-slate-800">{label}</div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option.value;

          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-full border px-3 py-2 text-sm transition ${
                active
                  ? `${option.className} ring-2 ring-blue-500`
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={active}
                onChange={() => handleChange(option.value)}
                className="sr-only"
              />
              {option.text}
            </label>
          );
        })}
      </div>
    </div>
  );
}