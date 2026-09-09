import type { ComponentPropsWithRef } from "react";

type CardProps = ComponentPropsWithRef<"div"> & { hoverable?: boolean };

// A visual container only. The page remains responsible for opening details.
export default function Card({ hoverable = false, className = "", children, ...props }: CardProps) {
    return (
        <div {...props} className={`min-w-0 rounded-card border border-border bg-white p-5 shadow-card sm:p-6 ${hoverable ? "transition-shadow hover:shadow-card-hover motion-reduce:transition-none" : ""} ${className}`}>
            {children}
        </div>
    );
}
