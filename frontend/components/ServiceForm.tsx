"use client";

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setMessage("");

        if (!token || !user) {
            setMessage("You must be logged in to submit a service.");
            return;
        }

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

            setMessage(
                service
                    ? "Unable to update service."
                    : "Unable to submit service."
            );
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <h2 className="text-2xl font-semibold">
                    {service ? "Edit Service" : "Add a Service"}
                </h2>

                <p className="text-neutral mt-1">
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
                <input
                    id="service-name"
                    type="text"
                    placeholder="Service name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="service-category"
                    className="block text-sm font-medium mb-1"
                >
                    Category
                </label>
                <input
                    id="service-category"
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
                    htmlFor="service-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <textarea
                    id="service-description"
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3 min-h-28"
                />
            </div>

            <div>
                <label
                    htmlFor="service-location"
                    className="block text-sm font-medium mb-1"
                >
                    Location
                </label>
                <input
                    id="service-location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="service-phone"
                    className="block text-sm font-medium mb-1"
                >
                    Phone
                </label>
                <input
                    id="service-phone"
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <div>
                <label
                    htmlFor="service-website"
                    className="block text-sm font-medium mb-1"
                >
                    Website
                </label>
                <input
                    id="service-website"
                    type="url"
                    placeholder="Website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="w-full border border-neutral/20 rounded-lg px-4 py-3"
                />
            </div>

            <button
                type="submit"
                className="bg-primary text-white px-4 py-3 rounded-lg"
            >
                {service ? "Save Changes" : "Submit Service"}
            </button>

            {service && onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="border px-4 py-3 rounded-lg"
                >
                    Cancel
                </button>
            )}

            {!service && (
                <p className="text-neutral mt-1">
                    {user?.role === "admin"
                        ? "This service will be published immediately."
                        : "This service will be submitted for admin approval."}
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