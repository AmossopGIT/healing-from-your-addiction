"use client";

import { useFormStatus } from "react-dom";

type CmsFormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
};

export function CmsFormSubmitButton({
  idleLabel,
  pendingLabel,
  className = "button button-primary",
  disabled = false,
}: CmsFormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button type="submit" className={className} disabled={isDisabled} aria-busy={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
