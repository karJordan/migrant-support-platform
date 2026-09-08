"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Briefcase, GraduationCap, MapPinSearch, Calendar } from "lucide-react";

interface Event {
  id: number;
  title: string;
  location: string;
  event_date: string;
  event_time: string;
  description: string;
  status: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  description: string;
  status: string;
}

interface Group {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
}


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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);
  const [newestJob, setNewestJob] = useState<Job | null>(null);
  const [popularGroup, setPopularGroup] = useState<Group | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await fetch("http://localhost:4000/api/community/events");
        const eventsData = await eventsRes.json();
        const approvedEvents = eventsData.filter((e: Event) => e.status === 'approved');
        if (approvedEvents.length > 0) {
          setUpcomingEvent(approvedEvents[0]);
        }

        const jobsRes = await fetch("http://localhost:4000/api/jobs");
        const jobsData = await jobsRes.json();
        const approvedJobs = jobsData.filter((j: Job) => j.status === 'approved');
        if (approvedJobs.length > 0) {
          setNewestJob(approvedJobs[0]);
        }

        const groupsRes = await fetch("http://localhost:4000/api/community/groups");
        const groupsData = await groupsRes.json();
        const approvedGroups = groupsData.filter((g: Group) => g.status === 'approved');
        if (approvedGroups.length > 0) {
          setPopularGroup(approvedGroups[0]);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-primary/10 overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="relative flex flex-col md:flex-row items-center">
            {/* Left Column */}
            <div className="flex-[1.6] flex flex-col gap-4 z-10">
              <h2 className="text-m font-semibold text-primary leading-tight">
              New Zealand&apos;s Migrant Support Platform 
              </h2>
              <h1 className="text-5xl font-bold text-text-primary leading-tight">
                Welcome to Your <br />
                <span className="text-primary">New Journey</span>
              </h1>
              <p className="text-neutral text-base max-w-md text-xl text-text-secondary">
                Everything you need to settle, connect and succeed in New Zealand.
              </p>

              <form onSubmit={handleSearch} className="flex items-center gap-2 mt-2 max-w-lg">
                <div className="flex-1 flex items-center gap-2 border border-neutral/30 rounded-lg px-4 py-3 bg-white">
                  <Search size={20} className="text-neutral" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services, jobs, resources..."
                    className="flex-1 outline-none body-small"
                    minLength={2}
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap body-small"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Purple Box */}
            <div className="flex-1 w-full -ml-16 md:-ml-24">
              <div className="bg-primary rounded-2xl p-6 md:p-8 text-white min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
        
                </div>
                
                <div className="space-y-4">
        {/* Upcoming Event */}
        {upcomingEvent ? (
            <Link href="/community" className="block bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="body-small font-bold text-white">Upcoming Event</p>
                        <p className="body-small text-xs text-white/90">{upcomingEvent.title}</p>
                        <p className="body-small text-white/60 text-xs">
                            {upcomingEvent.event_date ? new Date(upcomingEvent.event_date).toLocaleDateString() : 'TBC'} · {upcomingEvent.location || 'TBC'}
                        </p>
                    </div>
                </div>
            </Link>
        ) : (
            <div className="bg-white/10 rounded-xl p-4">
                <p className="body-small text-white/70">No upcoming events</p>
            </div>
        )}

        {/* New Job Listing */}
        {newestJob ? (
            <Link href="/jobs" className="block bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="body-small font-bold text-white">New Job Listing</p>
                        <p className="body-small text-xs text-white/90">{newestJob.title}</p>
                        <p className="body-small text-white/60 text-xs">{newestJob.company} · {newestJob.location || 'TBC'}</p>
                    </div>
                </div>
            </Link>
        ) : (
            <div className="bg-white/10 rounded-xl p-4">
                <p className="body-small text-white/70">No jobs posted yet</p>
            </div>
        )}

        {/* New Community Group */}
        {popularGroup ? (
            <Link href="/community" className="block bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="body-small font-bold text-white">New Community Group</p>
                        <p className="body-small text-xs text-white/90">{popularGroup.name}</p>
                        <p className="body-small text-white/60 text-xs">{popularGroup.category || 'Community Group'}</p>
                    </div>
                </div>
            </Link>
        ) : (
            <div className="bg-white/10 rounded-xl p-4">
                <p className="body-small text-white/70">No groups yet</p>
            </div>
        )}

                  <div className="pt-3 text-center">
                    <p className="text-s"> Trusted by 12,000+ Migrants </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-white border-y border-neutral/20">
        <div className="w-full max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="heading-1 text-4xl text-primary font-bold">12,000+</p>
              <p className="body-small text-sm text-neutral text-text-secondary">Migrants Helped</p>
            </div>
            <div className="relative pl-4 md:pl-6 space-y-1">
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-18 bg-gray-300"></div>
              <p className="heading-1 text-4xl text-primary font-black">500+</p>
              <p className="body-small text-sm text-neutral text-text-secondary">Local Services</p>
            </div>
            <div className="relative pl-4 md:pl-6 space-y-1">
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-18 bg-gray-300"></div>
              <p className="heading-1 text-4xl text-primary font-bold">2,400+</p>
              <p className="body-small text-sm text-neutral text-text-secondary">Jobs Listed</p>
            </div>
            <div className="relative pl-4 md:pl-6 space-y-1">
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-18 bg-gray-300"></div>
              <p className="heading-1 text-4xl text-primary font-bold text-primary font-bold">85+</p>
              <p className="body-small text-sm text-neutral text-text-secondary">Community Groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary">Explore MigrantHub</h2>
            <p className="text-l text-neutral text-text-secondary mt-2">Everything you need in one place</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(({ label, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="aspect-square flex flex-col items-start gap-2 border border-neutral/20 rounded-xl p-5 hover:border-primary transition-colors bg-white"
            >
              <Icon size={30} className="text-primary" />
              <div className="flex flex-col gap-1 mt-2">
                <span className="padding-5 font-semibold text-lg text-text-primary">{label}</span>
                <span className="text-md text-text-secondary">{description}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
            