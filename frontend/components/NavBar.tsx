"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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

    function handleLogout() {
        logout();
        router.push("/");
    }

    return (
        <nav className="hidden md:flex w-full items-center justify-between px-8 py-4 border-b border-neutral/20 bg-white">
            <Link href="/" className="text-lg font-semibold text-primary">
                MigrantHub
            </Link>

            <div className="flex items-center gap-6">
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

            <div className="flex items-center gap-3">
                {user ? (
                    <>
                    <Link href="/admin" className="text-sm font-medium text-black hover:text-primary transition-colors"
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
                    className="px-4 py-2 text-black font-bold rounded-lg hover:text-primary transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="px-4 py-2 bg-primary font-bold text-white rounded-lg hover:bg-primary/5 transition-colors"
                >
                    Sign Up
                </Link>
            </>
                )}
            </div>
        </nav>
    );
}