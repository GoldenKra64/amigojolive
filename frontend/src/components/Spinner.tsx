interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
} as const;

export default function Spinner({ label, size = 'md' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-slate-600">
      <span
        className={`${sizes[size]} animate-spin rounded-full border-slate-300 border-t-brand-600`}
        role="status"
        aria-label={label ?? 'Cargando'}
      />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
