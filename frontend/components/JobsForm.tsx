"use client";

import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import Feedback from "@/components/ui/Feedback";
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
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessage("");
        setMessageType("error");

        if (!token || !user) {
            setMessage("You must be logged in to submit a job.");
            return;
        }

        setIsSubmitting(true);
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
            setMessageType("success");

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
            setMessageType("error");

            setMessage(
                job
                    ? "Unable to update job."
                    : "Unable to submit job."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={isSubmitting}>
            <div>
                <h2 className="heading-3">
                    {job ? "Edit Job" : "Add a Job"}
                </h2>

                <p className="text-text-secondary mt-1">
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
                <Input
                    id="job-title"
                    type="text"
                    placeholder="Job title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="job-company"
                    className="block text-sm font-medium mb-1"
                >
                    Company
                </label>
                <Input
                    id="job-company"
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="job-location"
                    className="block text-sm font-medium mb-1"
                >
                    Location
                </label>
                <Input
                    id="job-location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="job-employment-type"
                    className="block text-sm font-medium mb-1"
                >
                    Employment Type
                </label>
                <Select
                    id="job-employment-type"
                    value={employmentType}
                    onChange={(event) => setEmploymentType(event.target.value)}
                    required
                >
                    <option value="">Select employment type</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Casual">Casual</option>
                </Select>
            </div>

            <div>
                <label
                    htmlFor="job-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <Textarea
                    id="job-description"
                    placeholder="Job description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                loading={isSubmitting}
                loadingLabel="Saving..."
            >
                {job ? "Save Changes" : "Submit Job"}
            </Button>

            {job && onCancel && (
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            )}

            {!job && (
                <p className="text-text-secondary mt-1">
                    {user?.role === "admin"
                        ? "This job will be published immediately."
                        : "This job will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <Feedback variant={messageType}>{message}</Feedback>
            )}
        </form>
    );
}
