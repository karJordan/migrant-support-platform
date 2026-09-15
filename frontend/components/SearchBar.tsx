"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchResult = {
  id: number;
  title: string;
  description: string;
  category?: string;
  location?: string;
  type: string;
  href: string;
};

type SearchBarProps = {
  type?: string; // e.g. "job", "service", "community", "resource" — omit for search-everything
  placeholder?: string;
};

export default function SearchBar({ type, placeholder = "Search..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  //const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ query });
        if (type) params.set("type", type);

        const res = await fetch(`http://localhost:4000/api/search?${params}`);
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce: wait 300ms after typing stops

    return () => clearTimeout(timeout);
  }, [query, type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleResultClick(result: SearchResult) {
    setShowDropdown(false);
    setQuery("");

    const element = document.getElementById(`card-${result.type}-${result.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
}

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 border border-neutral/20 rounded-xl px-4 py-3 bg-white">
        <Search size={18} className="text-neutral" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral/20 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {loading && (
            <p className="p-4 text-sm text-neutral">Searching...</p>
          )}
          {!loading && results.length === 0 && (
            <p className="p-4 text-sm text-neutral">No results found.</p>
          )}
          {!loading &&
            results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-4 py-3 hover:bg-primary/5 border-b border-neutral/10 last:border-0"
              >
                <p className="font-medium text-sm">{result.title}</p>
                <p className="text-xs text-neutral">
                  {result.category} {result.location && `• ${result.location}`}
                </p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}