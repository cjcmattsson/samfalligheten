import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import { Icon, type IconName } from "./icons";

const buttonBase =
  "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariants = {
  primary: "bg-brand text-brand-ink hover:opacity-90",
  secondary: "border border-line bg-surface text-ink hover:bg-sunken",
  ghost: "text-ink hover:bg-sunken",
  danger: "bg-danger text-surface hover:opacity-90",
};

type Variant = keyof typeof buttonVariants;

export function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: IconName }) {
  return (
    <button type="button" className={`${buttonBase} ${buttonVariants[variant]} ${className}`} {...props}>
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  variant = "primary",
  icon,
  children,
}: {
  to: string;
  variant?: Variant;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={`${buttonBase} ${buttonVariants[variant]}`}>
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </Link>
  );
}

const badgeTones = {
  neutral: "bg-sunken text-muted",
  brand: "bg-brand-soft text-brand-text",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</section>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-surface shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  side = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const placement = side
    ? "my-0 ml-auto mr-0 h-dvh max-h-dvh w-full max-w-lg"
    : "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={`bg-surface text-ink ${placement}`}
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Stäng" className="-m-1 rounded p-1 text-muted hover:text-ink">
              <Icon name="x" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-muted">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <Icon name={icon} className="mx-auto size-8 text-muted" />
      <p className="mt-3 font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Prose({ body }: { body: string }) {
  return (
    <div className="space-y-4 leading-relaxed">
      {body
        .split(/\n\s*\n/)
        .filter((block) => block.trim())
        .map((block, index) => {
          const lines = block.trim().split("\n");
          if (block.trim().startsWith("## ")) {
            return (
              <h2 key={index} className="pt-3 font-display text-xl font-semibold">
                {block.trim().slice(3)}
              </h2>
            );
          }
          if (lines.every((line) => line.startsWith("- "))) {
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-5">
                {lines.map((line) => (
                  <li key={line}>{line.slice(2)}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{block}</p>;
        })}
    </div>
  );
}
