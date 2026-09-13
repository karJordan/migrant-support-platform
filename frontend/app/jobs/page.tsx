"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import JobsForm from "@/components/JobsForm";
import JobsCard from "@/components/JobsCard";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types/job";
import FilterChipRow from "@/components/FilterChipRow";



export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState("All");
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditing, setIsEditing] = useState(false);
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
            <h1 className="text-2xl font-bold sm:text-3xl">
                Find Jobs
            </h1>

            <p className="hidden sm:block text-neutral mt-2">
                Browse job opportunities for migrants in New Zealand.
            </p>
            <FilterChipRow
                options={employmentTypes}
                selectedOption={selectedEmploymentType}
                onSelect={setSelectedEmploymentType}
                ariaLabel="Filter jobs by employment type"
            />

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
                                <div
                                    key={job.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setSelectedJob(job);
                                        setIsEditing(false);
                                    }}
                                    aria-label={`View details for ${job.title}`}
                                    onKeyDown={(keyEvent) => {
                                        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                            keyEvent.preventDefault();
                                            setSelectedJob(job);
                                            setIsEditing(false);
                                        }
                                    }}
                                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                                >
                                    <JobsCard
                                        id={job.id}
                                        title={job.title}
                                        company={job.company}
                                        location={job.location}
                                        employmentType={job.employment_type}
                                        description={job.description}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {selectedJob && (
                <Modal
                    onClose={() => {
                        setSelectedJob(null);
                        setIsEditing(false);
                    }}
                >
                    {isEditing ? (
                        <JobsForm
                            job={selectedJob}
                            onCancel={() => setIsEditing(false)}
                            onSaved={(updatedJob) => {
                                setJobs((currentJobs) =>
                                    currentJobs.map((job) =>
                                        job.id === updatedJob.id
                                            ? updatedJob
                                            : job
                                    )
                                );

                                setSelectedJob(updatedJob);
                                setIsEditing(false);
                            }}
                        />
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold">
                                {selectedJob.title}
                            </h2>

                            <p className="font-medium mt-1">
                                {selectedJob.company}
                            </p>

                            <p className="text-neutral mt-2">
                                {selectedJob.description}
                            </p>

                            <div className="flex items-center gap-2 mt-4 text-neutral">
                                <span>
                                    Location: {selectedJob.location}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-neutral">
                                <span>
                                    Employment Type: {selectedJob.employment_type}
                                </span>
                            </div>

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-lg mt-6"
                                >
                                    Edit
                                </button>
                            )}
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
}