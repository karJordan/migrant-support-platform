"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export type CategoryType = "service" | "job" | "resource" | "community";
type Category = { id: number; name: string; applies_to: CategoryType[] };

export function useCategoryOptions(type: CategoryType) {
    const [state, setState] = useState<{ options: Category[]; loading: boolean; error: string }>({ options: [], loading: true, error: "" });
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            try {
                const response = await fetch(`http://localhost:4000/api/categories?type=${type}`, { signal: controller.signal });
                if (!response.ok) throw new Error("Could not load categories. Please try again.");
                const options: Category[] = await response.json();
                if (!Array.isArray(options) || options.some(option => !Number.isInteger(option.id) || typeof option.name !== "string")) {
                    throw new Error("Could not load categories. Please try again.");
                }
                if (!controller.signal.aborted) setState({ options, loading: false, error: "" });
            } catch (error) {
                if (!controller.signal.aborted) setState({ options: [], loading: false, error: error instanceof Error ? error.message : "Could not load categories." });
            }
        }
        void load();
        return () => controller.abort();
    }, [type, attempt]);
    return { ...state, retry: () => { setState({ options: [], loading: true, error: "" }); setAttempt(value => value + 1); } };
}

export default function CategoryField({ id, value, onChange, options, loading, error, retry, optional = false, disabled = false }: {
    id: string; value: string; onChange: (value: string) => void;
    options: Category[]; loading: boolean; error: string; retry: () => void;
    optional?: boolean; disabled?: boolean;
}) {
    const unavailable = value !== "" && !options.some(option => String(option.id) === value);
    return <div>
        <label htmlFor={id} className="block text-sm font-medium mb-1">Category {optional ? "(optional)" : "(required)"}</label>
        <Select id={id} value={value} onChange={event => onChange(event.target.value)} required={!optional}
            disabled={disabled || loading || Boolean(error)} aria-describedby={`${id}-help`}>
            <option value="">{loading ? "Loading categories…" : optional ? "No category" : "Select a category"}</option>
            {unavailable && <option value={value} disabled>Current category unavailable — choose another</option>}
            {options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
        </Select>
        <p id={`${id}-help`} className="text-sm text-text-secondary mt-1">
            {error || (loading ? "Loading available categories." : options.length === 0 ? "No categories available." : optional ? "You can leave this blank. This listing will still appear in Community." : "Choose the category that best fits this listing.")}
        </p>
        {error && <Button type="button" variant="secondary" onClick={retry} disabled={disabled}>Retry categories</Button>}
    </div>;
}
