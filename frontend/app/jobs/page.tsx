"use client";

import { useState, useEffect } from "react";

type Job = {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    description: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJobs() {
          try {
            const res = await fetch("http://localhost:4000/api/jobs");
            if (!res.ok) throw new Error("Failed to fetch jobs");
            const data = await res.json();
            setJobs(data);
          } catch {
            setError("Could not load jobs");
          } finally {
            setLoading(false);
          }
        }
        fetchJobs();
      }, []);

      return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Jobs</h1>

            <p className="text-neutral mt-2">
                Browse job opportunities for migrants in New Zealand.
            </p>

            {loading && (
                <p className="mt-8 text-neutral">Loading jobs...</p>
            )}

            {error && (
                <p className="mt-8">{error}</p>
            )}

            {!loading && !error && (
                <>
                    {jobs.length === 0 ? (
                        <p className="mt-8 text-neutral">No jobs found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {jobs.map((job) => (
                                <div key={job.id} className="border border-neutral/20 rounded-xl p-4 bg-white">
                                    <h2 className="font-semibold">{job.title}</h2>
                                    <p className="text-sm text-neutral">{job.company} • {job.location}</p>
                                    <p className="text-sm text-neutral mt-1">{job.employment_type}</p>
                                    <p className="text-sm text-neutral mt-2">{job.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}