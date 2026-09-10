"use client";

import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import Feedback from "@/components/ui/Feedback";
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
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessage("");
        setMessageType("error");

        if (!token || !user) {
            setMessage("You must be logged in to submit a resource.");
            return;
        }

        setIsSubmitting(true);
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
            setMessageType("success");

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
            setMessageType("error");

            setMessage(
                resource
                    ? "Unable to update resource."
                    : "Unable to submit resource."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={isSubmitting}>
            <div>
                <h2 className="heading-3">
                    {resource ? "Edit Resource" : "Add a Resource"}
                </h2>

                <p className="text-text-secondary mt-1">
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
                <Input
                    id="resource-title"
                    type="text"
                    placeholder="Resource title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="resource-category"
                    className="block text-sm font-medium mb-1"
                >
                    Category
                </label>
                <Input
                    id="resource-category"
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="resource-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <Textarea
                    id="resource-description"
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="resource-link"
                    className="block text-sm font-medium mb-1"
                >
                    Resource Link
                </label>
                <Input
                    id="resource-link"
                    helpText="Enter a complete URL, such as https://example.com."
                    type="url"
                    placeholder="Resource link"
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                loading={isSubmitting}
                loadingLabel="Saving..."
            >
                {resource ? "Save Changes" : "Submit Resource"}
            </Button>

            {resource && onCancel && (
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            )}

            {!resource && (
                <p className="text-text-secondary mt-1">
                    {user?.role === "admin"
                        ? "This resource will be published immediately."
                        : "This resource will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <Feedback variant={messageType}>{message}</Feedback>
            )}
        </form>
    );
}
