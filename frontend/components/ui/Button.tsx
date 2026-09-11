import type { ComponentPropsWithRef } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonProps = ComponentPropsWithRef<"button"> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    loading?: boolean;
    loadingLabel?: string;
};

const variants = {
    primary: "bg-primary text-white border-primary hover:bg-primary-hover",
    secondary: "bg-white text-primary border-primary hover:bg-primary-light",
    ghost: "bg-transparent text-primary border-transparent hover:bg-primary-light",
    danger: "bg-danger text-white border-danger hover:bg-danger-hover",
};

export default function Button({
    variant = "primary", size = "md", loading = false,
    loadingLabel, disabled, type = "button", className = "", children, ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-control border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${variants[variant]} ${size === "sm" ? "min-h-11 px-3 py-2 text-sm" : "min-h-12 px-4 py-3 text-sm"} ${className}`}
        >
            {loading && <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
            {loading && loadingLabel ? loadingLabel : children}
        </button>
    );
}
