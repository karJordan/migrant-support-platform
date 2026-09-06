"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Resource } from "@/types/resource";

type ResourcesFormProps = {
    resource?: Resource;
    onCancel?: () => void;
    onSaved?: (updatedResource: Resource) => void;
};

export default function ResourcesForm({
    resource,
    onCancel,
    onSaved,
}: ResourcesFormProps) {
    const { user, token } = useAuth();

    const [title, setTitle] = useState(resource?.title ?? "");
    const [category, setCategory] = useState(resource?.category ?? "");
    const [description, setDescription] = useState(
        resource?.description ?? ""
    );
    const [link, setLink] = useState(resource?.link ?? "");

    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a resource.");
            return;
        }

        try {
            const response = await fetch(
                resource
                    ? `http://localhost:4000/api/resources/${resource.id}`
                    : "http://localhost:4000/api/resources",
                {
                    method: resource ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        category,
                        description,
                        link,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    resource
                        ? "Failed to update resource"
                        : "Failed to submit resource"
                );
            }

            const updatedResource = await response.json();

            setMessage(
                resource
                    ? "Resource updated successfully."
                    : user.role === "admin"
                        ? "Resource added successfully."
                        : "Resource submitted for admin approval."
            );

            if (resource) {
                onSaved?.(updatedResource);
            }

            if (!resource) {
                setTitle("");
                setCategory("");
                setDescription("");
                setLink("");
            }
        } catch (error) {
            console.error(error);

            setMessage(
                resource
                    ? "Unable to update resource."
                    : "Unable to submit resource."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    {resource ? "Edit Resource" : "Add a Resource"}
                </h2>

                <p className="text-neutral mt-1">
                    {resource
                        ? "Update this resource."
                        : "Submit a resource for the community."}
                </p>
            </div>
            <div>
                <label
                    htmlFor="resource-title"
                    className="block text-sm font-medium mb-1"
                >
                    Resource Title
                </label>
                <input
                    id="resource-title"
                    type="text"
                    placeholder="Resource title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="resource-category"
                    className="block text-sm font-medium mb-1"
                >
                    Category
                </label>
                <input
                    id="resource-category"
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="resource-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <textarea
                    id="resource-description"
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
                />
            </div>

            <div>
                <label
                    htmlFor="resource-link"
                    className="block text-sm font-medium mb-1"
                >
                    Resource Link
                </label>
                <input
                    id="resource-link"
                    type="url"
                    placeholder="Resource link"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                {resource ? "Save Changes" : "Submit Resource"}
            </button>

            {resource && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="border px-4 py-3 rounded-lg"
                >
                    Cancel
                </button>
            )}

            {!resource && (
                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This resource will be published immediately."
                        : "This resource will be submitted for admin approval."}
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