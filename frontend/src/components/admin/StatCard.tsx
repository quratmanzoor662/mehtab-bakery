type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E8D5C4] bg-white p-4 shadow-[0_1px_0_rgba(44,24,16,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wide text-[#6B5344]">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl text-[#2C1810]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#6B5344]">{hint}</p> : null}
    </div>
  );
}
