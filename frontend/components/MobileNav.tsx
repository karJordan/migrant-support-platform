"use client"

import Link from "next/link"
import { usePathname } from "next/navigation";
import { Home, Grid, Briefcase, Heart, CircleUserRound } from "lucide-react"

const navItems = [
    { label : "Home", href: "/", icon: Home },
    { label : "Services", href: "/services", icon: Grid },
    { label : "Jobs", href: "/jobs", icon: Briefcase },
    { label : "Community", href: "/community", icon: Heart },
    { label : "Profile", href: "/profile", icon: CircleUserRound },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-neutral/20 bg-white py-3 md:hidden">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
    
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive ? "text-primary" : "text-neutral hover:text-primary"
                }`}
              >
                <Icon size={22} />
                {label}
              </Link>
            );
          })}
        </nav>
      );
    }