"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Job } from "@/types/job";

type JobsFormProps = {
    job?: Job;
    onCancel?: () => void;
    onSaved?: (updatedJob: Job) => void;
};

export default function JobsForm({
    job,
    onCancel,
    onSaved,
}: JobsFormProps) {
    const { user, token } = useAuth();

    const [title, setTitle] = useState(job?.title ?? "");
    const [company, setCompany] = useState(job?.company ?? "");
    const [location, setLocation] = useState(job?.location ?? "");
    const [employmentType, setEmploymentType] = useState(
        job?.employment_type ?? ""
    );
    const [description, setDescription] = useState(job?.description ?? "");

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a job.");
            return;
        }

        try {
            const response = await fetch(
                job
                    ? `http://localhost:4000/api/jobs/${job.id}`
                    : "http://localhost:4000/api/jobs",
                {
                    method: job ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        company,
                        location,
                        employment_type: employmentType,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    job
                        ? "Failed to update job"
                        : "Failed to submit job"
                );
            }

            const updatedJob = await response.json();

            setMessage(
                job
                    ? "Job updated successfully."
                    : user.role === "admin"
                        ? "Job added successfully."
                        : "Job submitted for admin approval."
            );

            if (job) {
                onSaved?.(updatedJob);
            }

            if (!job) {
                setTitle("");
                setCompany("");
                setLocation("");
                setEmploymentType("");
                setDescription("");
            }
        } catch (error) {
            console.error(error);

            setMessage(
                job
                    ? "Unable to update job."
                    : "Unable to submit job."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    {job ? "Edit Job" : "Add a Job"}
                </h2>

                <p className="text-neutral mt-1">
                    {job
                        ? "Update this job."
                        : "Submit a job opportunity."}
                </p>
            </div>
            <div>
                <label
                    htmlFor="job-title"
                    className="block text-sm font-medium mb-1"
                >
                    Job Title
                </label>
                <input
                    id="job-title"
                    type="text"
                    placeholder="Job title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="job-company"
                    className="block text-sm font-medium mb-1"
                >
                    Company
                </label>
                <input
                    id="job-company"
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="job-location"
                    className="block text-sm font-medium mb-1"
                >
                    Location
                </label>
                <input
                    id="job-location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="job-employment-type"
                    className="block text-sm font-medium mb-1"
                >
                    Employment Type
                </label>
                <select
                    id="job-employment-type"
                    value={employmentType}
                    onChange={(event) => setEmploymentType(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3 bg-white"
                >
                    <option value="">Select employment type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Casual">Casual</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor="job-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <textarea
                    id="job-description"
                    placeholder="Job description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
                />
            </div>

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                {job ? "Save Changes" : "Submit Job"}
            </button>

            {job && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="border px-4 py-3 rounded-lg"
                >
                    Cancel
                </button>
            )}

            {!job && (
                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This job will be published immediately."
                        : "This job will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <p className="text-sm text-neutral">
                    {message}
                </p>
            )}
        </form>
    );
}