import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
};

export function FormField({
  label,
  hint,
  error,
  id,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="wh-label">
        {label}
      </label>
      {hint && <p className="-mt-1 mb-2 text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <FormField label={label} hint={hint} error={error} id={fieldId}>
      <input
        id={fieldId}
        className={`wh-input ${error ? 'wh-input-error' : ''} ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function TextArea({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <FormField label={label} hint={hint} error={error} id={fieldId}>
      <textarea
        id={fieldId}
        className={`wh-textarea ${error ? 'wh-input-error' : ''} ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function FileUpload({
  label,
  hint,
  error,
  id,
  accept,
  required,
  name = 'resume',
}: FieldProps & {
  accept?: string;
  required?: boolean;
  name?: string;
}) {
  const fieldId = id || name;

  return (
    <FormField label={label} hint={hint} error={error} id={fieldId}>
      <div className={`wh-file-zone ${error ? 'border-red-300 bg-red-50/50' : ''}`}>
        <input id={fieldId} name={name} type="file" accept={accept} required={required} />
        <div className="pointer-events-none">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="#0071e3"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900">Drop your resume here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse · PDF only · max 5 MB</p>
        </div>
      </div>
    </FormField>
  );
}

export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="wh-alert-error" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
        <path
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: React.ReactNode;
  badge?: string;
}) {
  return (
    <header className="mb-8">
      {badge && (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          {badge}
        </span>
      )}
      <h1 className={`wh-page-title ${badge ? 'mt-3' : ''}`}>{title}</h1>
      {subtitle && <p className="wh-page-subtitle">{subtitle}</p>}
    </header>
  );
}
