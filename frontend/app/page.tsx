
import Link from "next/link";
import { Search, Users, Briefcase, GraduationCap, MapPinSearch } from "lucide-react";

const categories = [
  {
    label: "Find Local Services",
    description: "Housing, transport, healthcare, & more",
    href: "/services",
    icon: MapPinSearch,
  },

  {
    label: "Find Jobs",
    description: "Browse job and career resources",
    href: "/jobs",
    icon: Briefcase,
  },

  {
    label: "Community Support",
    description: "Join groups and events",
    href: "/community",
    icon: Users,
  },
  {
    label: "Learn & Grow",
    description: "Courses, education, & training",
    href: "/resources",
    icon: GraduationCap,
  },
];

export default function Home() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10">
      {/* Hero section */}
      <div className="relative flex flex-col md:flex-row items-center">
        <div className="flex-[1.6] flex flex-col gap-4 z-10">
          <h1 className="text-6xl font-semibold text-black leading-tight">
            Welcome to Your <br /> New Journey
          </h1>
          <p className="text-neutral text-base max-w-md text-xl">
            Everything you need to settle, connect and succeed in New Zealand.
          </p>

          <div className="flex items-center gap-2 mt-2 max-w-lg">
            <div className="flex-1 flex items-center gap-2 border border-neutral/30 rounded-lg px-4 py-3 bg-white">
            <Search size={20} className="text-neutral" />
              <input
                type="text"
                placeholder="Search services, jobs, resources..."
                className="flex-1 outline-none text-sm"
              />
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap text-sm">
              Search
            </button>
          </div>
        </div>

        <div className="flex-1 w-full h-72 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-sm -ml-16 md:-ml-24">
          [Image placeholder]
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-10 max-w-5xl">
        {categories.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="aspect-square flex flex-col items-start gap-2 border border-neutral/20 rounded-xl p-5 hover:border-primary transition-colors bg-white"
          >
            <Icon size={30} className="text-primary" />
          <div className="flex flex-col gap-1 mt-2">
            <span className="padding-5 font-semibold text-lg">{label}</span>
            <span className="text-md text-neutral">{description}</span>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
