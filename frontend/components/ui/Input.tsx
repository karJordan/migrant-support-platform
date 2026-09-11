"use client";

import { useId, type ComponentPropsWithRef } from "react";

// Shared by inputs, textareas and selects. Existing external labels still work.
const controlClass = "w-full min-h-12 rounded-control border border-border bg-white px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-background disabled:opacity-60 aria-invalid:border-danger";

type InputProps = ComponentPropsWithRef<"input"> & {
    label?: string;
    helpText?: string;
    error?: string;
};

export default function Input({ label, helpText, error, id, className = "", ...props }: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const description = [props["aria-describedby"], helpText && `${inputId}-help`, error && `${inputId}-error`].filter(Boolean).join(" ") || undefined;
    return (
        <div className="min-w-0">
            {label && <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{label}</label>}
            <input {...props} id={inputId} aria-describedby={description} aria-invalid={error ? true : props["aria-invalid"]} className={`${controlClass} ${className}`} />
            {helpText && <p id={`${inputId}-help`} className="mt-1 text-sm text-text-secondary">{helpText}</p>}
            {error && <p id={`${inputId}-error`} role="alert" className="mt-1 text-sm text-danger">{error}</p>}
        </div>
    );
}

export function Textarea({ className = "", ...props }: ComponentPropsWithRef<"textarea">) {
    return <textarea {...props} className={`${controlClass} min-h-28 resize-y ${className}`} />;
}

export function Select({ className = "", ...props }: ComponentPropsWithRef<"select">) {
    return <select {...props} className={`${controlClass} ${className}`} />;
}
