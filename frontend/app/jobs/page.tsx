"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import JobsForm from "@/components/JobsForm";
import JobsCard from "@/components/JobsCard";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types/job";
import FilterChipRow from "@/components/FilterChipRow";
import SearchBar from "@/components/SearchBar";

function JobsContent() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState("All");
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(
        new Set()
    );
    const [applicationLoading, setApplicationLoading] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState("");
    const { user, token } = useAuth();

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

    // Fetch the user's job applications if they are logged in
    useEffect(() => {
        if (!token) {
            setAppliedJobIds(new Set());
            return;
        }

        const controller = new AbortController();

        async function fetchApplications() {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/jobs/applications/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch applications");
                }

                const applications: { job_id: number }[] =
                    await response.json();

                if (!controller.signal.aborted) {
                    setAppliedJobIds(
                        new Set(
                            applications.map((application) =>
                                Number(application.job_id)
                            )
                        )
                    );
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(
                        "Could not load job applications:",
                        error
                    );
                }
            }
        }

        void fetchApplications();

        return () => controller.abort();
    }, [token]);

    const employmentTypes = [
        "All",
        ...new Set(jobs.map((job) => job.employment_type))
    ];

    const filteredJobs =
        selectedEmploymentType === "All"
            ? jobs
            : jobs.filter((job) => job.employment_type === selectedEmploymentType);

    const searchParams = useSearchParams();

    useEffect(() => {
        const highlight = searchParams.get("highlight");
        if (highlight && filteredJobs.length > 0) {
            const element = document.getElementById(`card-${highlight}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-2", "ring-primary");
                setTimeout(() => element.classList.remove("ring-2", "ring-primary"), 2000);
            }
        }
    }, [searchParams, filteredJobs]);

    // Function to handle job application
    async function applyForJob(jobId: number) {
        if (!token) {
            setApplicationMessage(
                "You must be logged in to apply for a job."
            );
            return;
        }

        setApplicationLoading(true);
        setApplicationMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/jobs/${jobId}/apply`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: { message?: string } = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not submit application"
                );
            }

            setAppliedJobIds((currentIds) => {
                const updatedIds = new Set(currentIds);
                updatedIds.add(jobId);
                return updatedIds;
            });

            setApplicationMessage(
                data.message || "Application submitted successfully."
            );
        } catch (error) {
            setApplicationMessage(
                error instanceof Error
                    ? error.message
                    : "Could not submit application"
            );
        } finally {
            setApplicationLoading(false);
        }
    }
    // Function to handle withdrawing a job application
    async function withdrawApplication(jobId: number) {
        if (!token) {
            return;
        }

        setApplicationLoading(true);
        setApplicationMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/jobs/${jobId}/apply`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: { message?: string } = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not withdraw application"
                );
            }

            setAppliedJobIds((currentIds) => {
                const updatedIds = new Set(currentIds);
                updatedIds.delete(jobId);
                return updatedIds;
            });

            setApplicationMessage(
                data.message || "Application withdrawn successfully."
            );
        } catch (error) {
            setApplicationMessage(
                error instanceof Error
                    ? error.message
                    : "Could not withdraw application"
            );
        } finally {
            setApplicationLoading(false);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold sm:text-3xl">
                Find Jobs
            </h1>
            <p className="hidden sm:block text-sm text-text-secondary mt-2 mb-6">
                Browse job opportunities for migrants in New Zealand.
            </p>
            <SearchBar type="job" placeholder="Search jobs..." />
            <FilterChipRow
                options={employmentTypes}
                selectedOption={selectedEmploymentType}
                onSelect={setSelectedEmploymentType}
                ariaLabel="Filter jobs by employment type"
            />

            {loading && <p className="mt-8 text-neutral">Loading jobs...</p>}
            {error && <p className="mt-8">{error}</p>}

            {!loading && !error && (
                <>
                    {filteredJobs.length === 0 ? (
                        <p className="mt-8 text-neutral">No jobs found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    id={`card-job-${job.id}`}
                                    role="button"
                                    tabIndex={0}
                                    // Handle both click and keyboard events for accessibility
                                    onClick={() => {
                                        setSelectedJob(job);
                                        setIsEditing(false);
                                        setApplicationMessage("");
                                    }}
                                    aria-label={`View details for ${job.title}`}
                                    onKeyDown={(keyEvent) => {
                                        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                            keyEvent.preventDefault();
                                            setSelectedJob(job);
                                            setIsEditing(false);
                                            setApplicationMessage("");
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
                                        job.id === updatedJob.id ? updatedJob : job
                                    )
                                );
                                setSelectedJob(updatedJob);
                                setIsEditing(false);
                            }}
                        />
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold">{selectedJob.title}</h2>
                            <p className="font-medium mt-1">{selectedJob.company}</p>
                            <p className="text-neutral mt-2">{selectedJob.description}</p>
                            <div className="flex items-center gap-2 mt-4 text-neutral">
                                <span>Location: {selectedJob.location}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-neutral">
                                <span>Employment Type: {selectedJob.employment_type}</span>
                            </div>
                            {/* Display the apply/withdraw button only for non-admin users */}
                            {user && user.role !== "admin" && (
                                <div className="mt-6">
                                    {appliedJobIds.has(Number(selectedJob.id)) ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                withdrawApplication(Number(selectedJob.id))
                                            }
                                            disabled={applicationLoading}
                                            className="
                    rounded-control border border-primary
                    bg-white px-6 py-3 font-medium text-primary
                    transition-colors hover:bg-primary-light
                    disabled:cursor-not-allowed disabled:opacity-60
                "
                                        >
                                            {applicationLoading
                                                ? "Withdrawing..."
                                                : "Withdraw application"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                applyForJob(Number(selectedJob.id))
                                            }
                                            disabled={applicationLoading}
                                            className="
                    rounded-control bg-primary
                    px-6 py-3 font-medium text-white
                    transition-colors hover:bg-primary-hover
                    disabled:cursor-not-allowed disabled:opacity-60
                "
                                        >
                                            {applicationLoading
                                                ? "Applying..."
                                                : "Apply"}
                                        </button>
                                    )}

                                    {applicationMessage && (
                                        <p
                                            role="status"
                                            className="mt-3 text-sm text-text-secondary"
                                        >
                                            {applicationMessage}
                                        </p>
                                    )}
                                </div>
                            )}
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

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <JobsContent />
        </Suspense>
    );
}