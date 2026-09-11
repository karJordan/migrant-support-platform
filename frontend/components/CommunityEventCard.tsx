import Card from "@/components/ui/Card";
import { MapPin } from "lucide-react";
import SaveButton from "@/components/SaveButton";

type CommunityEventProps = {
    id: string | number;
    title: string;
    eventDate: string;
    eventTime: string;
    description: string;
    location: string;
};

export default function CommunityEventCard({
    id,
    title,
    description,
    eventDate,
    eventTime,
    location,
}: CommunityEventProps) {
    const formattedDate = new Date(eventDate).toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return (
        <Card hoverable>
            <div className="flex items-start justify-between gap-4">
            <h2 className="heading-4 min-w-0 break-words">
                {title}
            </h2>
            <SaveButton itemType="community_event" itemId={id} />
            </div>
            <p className="mt-2 text-sm font-medium text-text-secondary">
                {formattedDate} at {eventTime}
            </p>

            <p className="text-text-secondary mt-2 break-words">
                {description}
            </p>

            <div className="flex items-center gap-2 mt-4 text-text-secondary">
                <MapPin size={18} aria-hidden="true" className="shrink-0" />
                <span>{location}</span>
            </div>
        </Card>
    );
}
