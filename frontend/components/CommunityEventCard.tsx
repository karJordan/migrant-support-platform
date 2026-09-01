import { MapPin } from "lucide-react";

type CommunityEventProps = {
    title: string;
    eventDate: string;
    eventTime: string;
    description: string;
    location: string;
};

export default function CommunityEventCard({
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
        <div className="border border-neutral/20 rounded-xl p-5 bg-white">
            <span className="text-sm text-primary font-medium">
                {title}
            </span>
            <h2 className="text-xl font-semibold mt-2">
                {formattedDate} at {eventTime}
            </h2>

            <p className="text-neutral mt-2">
                {description}
            </p>

            <div className="flex items-center gap-2 mt-4 text-neutral">
                <MapPin size={18} />
                <span>{location}</span>
            </div>
        </div>
    );
}