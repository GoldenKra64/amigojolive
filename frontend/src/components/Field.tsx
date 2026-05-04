import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

type InputFieldProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    as?: 'input';
  };

type TextareaFieldProps = BaseFieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    as: 'textarea';
  };

type FieldProps = InputFieldProps | TextareaFieldProps;

const baseInputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-100 disabled:text-slate-500';

export default function Field(props: FieldProps): ReactNode {
  const { label, hint, error, required, ...rest } = props;
  const inputId = (rest as { id?: string }).id ?? rest.name;

  return (
    <label className="flex flex-col gap-1" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {props.as === 'textarea' ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          id={inputId}
          className={`${baseInputClasses} min-h-[96px] resize-y`}
        />
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          id={inputId}
          className={baseInputClasses}
        />
      )}
      {hint && !error && (
        <span className="text-xs text-slate-500">{hint}</span>
      )}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
