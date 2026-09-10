"use client";

import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import Feedback from "@/components/ui/Feedback";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Service } from "@/types/service";

type ServiceFormProps = {
    service?: Service;
    onCancel?: () => void;
    onSaved?: (updatedService: Service) => void;
};

export default function ServiceForm({
    service,
    onCancel,
    onSaved,
}: ServiceFormProps) {
    const { user, token } = useAuth();

    const [name, setName] = useState(service?.name ?? "");
    const [category, setCategory] = useState(service?.category ?? "");
    const [description, setDescription] = useState(service?.description ?? "");
    const [location, setLocation] = useState(service?.location ?? "");
    const [phone, setPhone] = useState(service?.phone ?? "");
    const [website, setWebsite] = useState(service?.website ?? "");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessage("");
        setMessageType("error");

        if (!token || !user) {
            setMessage("You must be logged in to submit a service.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(
                service
                    ? `http://localhost:4000/api/services/${service.id}`
                    : "http://localhost:4000/api/services",
                {
                    method: service ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        category,
                        description,
                        location,
                        phone,
                        website,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    service
                        ? "Failed to update service"
                        : "Failed to submit service"
                );
            }
            const updatedService = await response.json();
            setMessageType("success");

            setMessage(
                service
                    ? "Service updated successfully."
                    : "Service submitted successfully."
            );

            if (service) {
                onSaved?.(updatedService);
            }

            if (!service) {
                setName("");
                setCategory("");
                setDescription("");
                setLocation("");
                setPhone("");
                setWebsite("");
            }
        } catch (error) {
            console.error(error);
            setMessageType("error");

            setMessage(
                service
                    ? "Unable to update service."
                    : "Unable to submit service."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={isSubmitting}>
            <div>
                <h2 className="heading-3">
                    {service ? "Edit Service" : "Add a Service"}
                </h2>

                <p className="text-text-secondary mt-1">
                    {service
                        ? "Update this service."
                        : "Submit a service for the community."}
                </p>
            </div>

            <div>
                <label
                    htmlFor="service-name"
                    className="block text-sm font-medium mb-1"
                >
                    Service Name
                </label>
                <Input
                    id="service-name"
                    type="text"
                    placeholder="Service name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="service-category"
                    className="block text-sm font-medium mb-1"
                >
                    Category
                </label>
                <Input
                    id="service-category"
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="service-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <Textarea
                    id="service-description"
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </div>

            <div>
                <label
                    htmlFor="service-location"
                    className="block text-sm font-medium mb-1"
                >
                    Location
                </label>
                <Input
                    id="service-location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                />
            </div>

            <div>
                <label
                    htmlFor="service-phone"
                    className="block text-sm font-medium mb-1"
                >
                    Phone
                </label>
                <Input
                    id="service-phone"
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                />
            </div>

            <div>
                <label
                    htmlFor="service-website"
                    className="block text-sm font-medium mb-1"
                >
                    Website
                </label>
                <Input
                    id="service-website"
                    type="url"
                    placeholder="Website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                />
            </div>

            <Button
                type="submit"
                loading={isSubmitting}
                loadingLabel="Saving..."
            >
                {service ? "Save Changes" : "Submit Service"}
            </Button>

            {service && onCancel && (
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            )}

            {!service && (
                <p className="text-text-secondary mt-1">
                    {user?.role === "admin"
                        ? "This service will be published immediately."
                        : "This service will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <Feedback variant={messageType}>{message}</Feedback>
            )}
        </form>
    );
}
