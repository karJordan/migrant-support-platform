import type { ReactNode } from "react";
import { CircleCheck, CircleAlert, Info, LoaderCircle, Inbox, TriangleAlert } from "lucide-react";

type FeedbackProps = {
    variant?: "success" | "error" | "warning" | "info" | "loading" | "empty";
    children: ReactNode;
    className?: string;
};

const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-primary/20 bg-primary-light text-text-primary",
    loading: "border-border bg-background text-text-secondary",
    empty: "border-border bg-background text-text-secondary",
};
const icons = { success: CircleCheck, error: CircleAlert, warning: TriangleAlert, info: Info, loading: LoaderCircle, empty: Inbox };

export default function Feedback({ variant = "info", children, className = "" }: FeedbackProps) {
    const Icon = icons[variant];
    return (
        <div role={variant === "error" ? "alert" : "status"} aria-atomic="true" className={`flex items-start gap-2 rounded-control border p-4 text-sm ${styles[variant]} ${className}`}>
            <Icon size={18} aria-hidden="true" className={`mt-0.5 shrink-0 ${variant === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`} />
            <div className="min-w-0">{children}</div>
        </div>
    );
}
