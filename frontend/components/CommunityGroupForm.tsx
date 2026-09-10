"use client";

import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import Feedback from "@/components/ui/Feedback";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommunityGroup } from "@/types/group";

type CommunityGroupFormProps = {
    group?: CommunityGroup;
    onCancel?: () => void;
    onSaved?: (updatedGroup: CommunityGroup) => void;
};

export default function CommunityGroupForm({
    group,
    onCancel,
    onSaved,
}: CommunityGroupFormProps) {
    const { user, token } = useAuth();

    const [name, setName] = useState(group?.name ?? "");
    const [category, setCategory] = useState(group?.category ?? "");
    const [description, setDescription] = useState(
        group?.description ?? ""
    );

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("error");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) return;
        setMessage("");
        setMessageType("error");

        if (!token || !user) {
            setMessage("You must be logged in to submit a community group.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(
                group
                    ? `http://localhost:4000/api/community/groups/${group.id}`
                    : "http://localhost:4000/api/community/groups",
                {
                    method: group ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name,
                        category,
                        description,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    group
                        ? "Failed to update community group"
                        : "Failed to submit community group"
                );
            }

            const updatedGroup = await response.json();
            setMessageType("success");

            setMessage(
                group
                    ? "Community group updated successfully."
                    : user.role === "admin"
                        ? "Community group added successfully."
                        : "Community group submitted for admin approval."
            );

            if (group) {
                onSaved?.(updatedGroup);
            }

            if (!group) {
                setName("");
                setCategory("");
                setDescription("");
            }
        } catch (error) {
            console.error(error);
            setMessageType("error");

            setMessage(
                group
                    ? "Unable to update community group."
                    : "Unable to submit community group."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={isSubmitting}>
            <div>
                <h2 className="heading-3">
                    {group
                        ? "Edit Community Group"
                        : "Add a Community Group"}
                </h2>

                <p className="text-text-secondary mt-1">
                    {group
                        ? "Update this community group."
                        : "Submit a community group."}
                </p>
            </div>

            <div>
                <label
                    htmlFor="group-name"
                    className="block text-sm font-medium mb-1"
                >
                    Group Name
                </label>
                <Input
                    id="group-name"
                    type="text"
                    placeholder="Group name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="group-category"
                    className="block text-sm font-medium mb-1"
                >
                    Category
                </label>
                <Input
                    id="group-category"
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="group-description"
                    className="block text-sm font-medium mb-1"
                >
                    Description
                </label>
                <Textarea
                    id="group-description"
                    placeholder="Group description"
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
                {group ? "Save Changes" : "Submit Group"}
            </Button>

            {group && onCancel && (
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="secondary"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            )}

            {!group && (
                <p className="text-text-secondary mt-1">
                    {user?.role === "admin"
                        ? "This group will be published immediately."
                        : "This group will be submitted for admin approval."}
                </p>
            )}

            {message && (
                <Feedback variant={messageType}>{message}</Feedback>
            )}
        </form>
    );
}
