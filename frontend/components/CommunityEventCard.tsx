import Card from "@/components/ui/Card";
import { CalendarDays, MapPin, Clock } from "lucide-react";

type CommunityEventProps = {
    id: string | number;
    title: string;
    eventDate: string;
    eventTime: string;
    description: string;
    location: string;
};

const iconColours = ["bg-pink-500", "bg-violet-500", "bg-amber-500"];

export default function CommunityEventCard({ id, title, eventDate, eventTime, location }: CommunityEventProps) {
    const date = new Date(eventDate);
    const formattedDate = Number.isNaN(date.getTime()) ? "Date to be confirmed" : date.toLocaleDateString("en-NZ", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
    const colourIndex = Array.from(String(id)).reduce((sum, character) => sum + character.charCodeAt(0), 0) % iconColours.length;

    return (
        <Card hoverable className="h-full">
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <div aria-hidden="true" className={`flex h-16 items-center justify-center rounded-2xl text-white ${iconColours[colourIndex]}`}>
                    <CalendarDays size={22} />
                </div>
                <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold leading-snug">{title}</h2>
                    <p className="mt-1 text-sm font-medium text-primary">{formattedDate}</p>
                    {eventTime && <p className="mt-1 flex items-start gap-1.5 text-sm text-text-secondary"><Clock size={14} aria-hidden="true" className="mt-0.5 shrink-0" /><span>{eventTime.slice(0, 5)}</span></p>}
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-text-secondary"><MapPin size={14} aria-hidden="true" className="mt-0.5 shrink-0" /><span className="break-words">{location || "Location to be confirmed"}</span></p>
                    <div className="mt-3 flex justify-end"></div>
                </div>
            </div>
        </Card>
    );
}
