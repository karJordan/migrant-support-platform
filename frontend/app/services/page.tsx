"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/ServicesCard";
import Modal from "@/components/Modal";
import ServiceForm from "@/components/ServiceForm";

type Service = {
    id: number;
    name: string;
    category: string;
    description: string;
    location: string;
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showServiceForm, setShowServiceForm] = useState(false);

    const [selectedService, setSelectedService] = useState<Service | null>(null);

    useEffect(() => {
        async function fetchServices() {
            try {
                const response = await fetch("http://localhost:4000/api/services");

                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }

                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error(error);
                setError("Unable to load services.");
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);
    const categories = ["All", ...new Set(services.map((service) => service.category))];

    const filteredServices =
        selectedCategory === "All"
            ? services
            : services.filter((service) => service.category === selectedCategory);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-4xl font-semibold">Find Local Services</h1>

            <p className="text-neutral mt-2">
                Find services and support available in your community.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
                <button
                    onClick={() => setShowServiceForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg"
                >
                    Add New Service
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${selectedCategory === category
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-neutral/20"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            {loading && (
                <p className="mt-8 text-neutral">
                    Loading services...
                </p>
            )}

            {error && (
                <p className="mt-8">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <>
                    {filteredServices.length === 0 ? (
                        <p className="mt-8 text-neutral">
                            No services found in this category.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className="cursor-pointer"
                                >
                                    <ServiceCard
                                        name={service.name}
                                        category={service.category}
                                        description={service.description}
                                        location={service.location}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {showServiceForm && (
                <Modal onClose={() => setShowServiceForm(false)}>
                    <ServiceForm />
                </Modal>
            )}
            {selectedService && (
                <Modal onClose={() => setSelectedService(null)}>
                    <h2 className="text-2xl font-semibold">
                        {selectedService.name}
                    </h2>

                    <p className="text-primary mt-2">
                        {selectedService.category}
                    </p>

                    <p className="mt-4">
                        {selectedService.description}
                    </p>

                    <p className="mt-4">
                        {selectedService.location}
                    </p>
                </Modal>
            )}
        </div>
    );
}