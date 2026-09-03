"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import { useSearchParams} from "next/navigation";
import { Briefcase, MapPin, Users, Calendar, ArrowLeft, BookOpen } from "lucide-react";

interface SearchResult {
    id: number;
    title: string;
    description: string;
    type: "service" | "job" | "community_event" | "community_group" | "resource";
    href: string;
    category?: string;
    location?: string;
    company?: string;
    employment_type?: string;
}

const iconMap = {
    service: MapPin,
    job: Briefcase,
    community_event: Calendar,
    community_group: Users,
    resource: BookOpen,
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query && query.length >= 2) {
            fetchSearchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    async function fetchSearchResults() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:4000/api/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch search results");
            }
            const data = await response.json();
            setResults(data);
        } catch {
            setError("Error fetching search results");
        } finally {
            setLoading(false);
        }
    }

    {/* function to lead clicking to page whilst there is no detail view yet */}
    const getHref = (result: SearchResult) => {
        switch (result.type) {
            case 'service':
                return '/services';
            case 'job':
                return '/jobs';
            case 'resource':
                return '/resources';
            case 'community_event':
            case 'community_group':
                return '/community';
            default:
                return '#';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-10">
      {/* Search Header */}
      <div className="mb-8">
        <Link href = "/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft size={16} />
            Back to Home
        </Link>
        <h1 className="text-2xl font-semibold text-black mb-2">Search Results</h1>
        <p className="text-neutral">
          {!query && "Enter a search term to find services, jobs, and resources."}
          {query && !loading && `Showing results for "${query}"`}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-neutral mt-4">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg text-neutral-600">No results found for &quot;{query}&rdquo;</p>
          <p className="text-sm text-neutral-500 mt-2">Try different keywords or browse our categories below.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/services" className="text-primary hover:underline">
              Browse Services
            </Link>
            <Link href="/jobs" className="text-primary hover:underline">
              Browse Jobs
            </Link>
            <Link href="/resources" className="text-primary hover:underline">
              Browse Resources
            </Link>
            <Link href="/community" className="text-primary hover:underline">
              Browse Community
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-neutral-600 mb-4">
            Found {results.length} result{results.length > 1 ? "s" : ""}
          </div>

          {results.map((result) => {
            const Icon = iconMap[result.type] || MapPin;

            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={getHref(result)} // while there is no detail view direct to the main page of the type
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-primary transition-colors hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-black hover:text-primary transition-colors">
                        {result.title}
                      </h3>
                      <span className="text-xs bg-gray-100 text-neutral-600 px-2 py-1 rounded-full capitalize">
                        {result.type === "community_event" ? "Event" :
                         result.type === "community_group" ? "Group" :
                         result.type === "service" ? "Service" :
                         result.type === "job" ? "Job" :
                         result.type === "resource" ? "Resource" :
                         result.type}
                      </span>
                    </div>

                    <p className="text-neutral text-sm mt-1 line-clamp-2">
                      {result.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                      {result.category && (
                        <span className="flex items-center gap-1">
                          <span className="text-xs">📂</span> {result.category}
                        </span>
                      )}
                      {result.location && (
                        <span className="flex items-center gap-1">
                          <span className="text-xs">📍</span> {result.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}