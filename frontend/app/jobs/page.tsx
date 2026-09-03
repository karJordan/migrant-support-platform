"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import JobsForm from "@/components/JobsForm";
import JobsCard from "@/components/JobsCard";
import { useAuth } from "@/context/AuthContext";

type Job = {
    id: number;
    title: string;
    company: string;
    location: string;
    employment_type: string;
    description: string;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState("All");
    const [showJobForm, setShowJobForm] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        async function fetchJobs() {
            try {
                const res = await fetch("http://localhost:4000/api/jobs");

                if (!res.ok) {
                    throw new Error("Failed to fetch jobs");
                }

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

    const employmentTypes = [
        "All",
        ...new Set(jobs.map((job) => job.employment_type))
    ];

    const filteredJobs =
        selectedEmploymentType === "All"
            ? jobs
            : jobs.filter(
                (job) => job.employment_type === selectedEmploymentType
            );

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Jobs</h1>

            <p className="text-neutral mt-2">
                Browse job opportunities for migrants in New Zealand.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
                {user && (
                    <button
                        onClick={() => setShowJobForm(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Add Job
                    </button>
                )}

                {employmentTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedEmploymentType(type)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${selectedEmploymentType === type
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-neutral/20"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            {loading && (
                <p className="mt-8 text-neutral">
                    Loading jobs...
                </p>
            )}

            {error && (
                <p className="mt-8">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {filteredJobs.length === 0 ? (
                        <p className="mt-8 text-neutral">
                            No jobs found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {filteredJobs.map((job) => (
                                <JobsCard
                                    key={job.id}
                                    title={job.title}
                                    company={job.company}
                                    location={job.location}
                                    description={job.description}
                                    employmentType={job.employment_type}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
            {showJobForm && (
                <Modal onClose={() => setShowJobForm(false)}>
                    <JobsForm />
                </Modal>
            )}
        </div>
    );
}