"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Handshake } from "lucide-react";

const navLinks = [
    { label : "Home", href: "/" },
    { label : "Services", href: "/services" },
    { label : "Jobs", href: "/jobs" },
    { label : "Community", href: "/community" },
    { label : "Resources", href: "/resources" },
];

export default function NavBar() {

    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    function handleLogout() {
        logout();
        router.push("/");
    }

    return (
        <nav className={`${pathname === "/" ? "flex" : "hidden md:flex"} w-full flex-wrap gap-3 items-center justify-between px-4 md:px-8 py-4 border-b border-neutral/20 bg-white`}>
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg flex-shrink-0">
                    <Handshake size={18} className="text-white" />
                </div>
                <span className="text-xl font-semibold text-primary">MigrantHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-black hover:text-primary transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
                {user ? (
                    <>
                    <Link 
                    href={user.role === "admin" ? "/admin" : "/userDashboard"} 
                    className="text-sm font-medium text-black hover:text-primary transition-colors"
                    >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-sm"
            >
              Log out
            </button>
          </>
        ) : (
          <>    
                <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 text-sm font-bold text-black rounded-lg hover:text-primary transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="px-3 sm:px-4 py-2 text-sm bg-primary font-bold text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Sign Up
                </Link>
            </>
                )}
            </div>
        </nav>
    );
}