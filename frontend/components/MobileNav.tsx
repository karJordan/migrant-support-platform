"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Home, Search, Briefcase, Users, CircleUserRound } from "lucide-react";

export default function MobileNav() {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();
    const homeHref = user
        ? user.role === "admin" ? "/admin" : "/userDashboard"
        : "/";
    const items = [
        { label: "Home", href: homeHref, icon: Home },
        { label: "Services", href: "/services", icon: Search },
        { label: "Jobs", href: "/jobs", icon: Briefcase },
        { label: "Community", href: "/community", icon: Users },
        { label: "Profile", href: user ? "/profile" : "/login", icon: CircleUserRound },
    ];

    return (
        <nav aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-white pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
            {items.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
                const waitingForAccount = (label === "Home" || label === "Profile") && isLoading;
                return (
                    <Link
                        key={label}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        aria-disabled={waitingForAccount || undefined}
                        onClick={(event) => { if (waitingForAccount) event.preventDefault(); }}
                        className={`flex min-h-12 min-w-0 flex-1 flex-col items-center gap-1 text-xs transition-colors ${isActive ? "text-primary" : "text-text-secondary hover:text-primary"}`}
                    >
                        <span className={`rounded-full p-2 ${isActive ? "bg-primary-light" : ""}`}>
                            <Icon size={22} aria-hidden="true" />
                        </span>
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
