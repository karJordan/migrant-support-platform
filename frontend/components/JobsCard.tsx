import Card from "@/components/ui/Card";
import { MapPin, BriefcaseBusiness } from "lucide-react";
import FavouriteButton from "@/components/FavouriteButton";

type JobsCardProps = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  description: string;
  employmentType: string;
};

export default function JobsCard({
  id,
  title,    
  company,
  location,
  description,
  employmentType,
}: JobsCardProps) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between gap-4">
            <h2 className="heading-4 min-w-0 break-words">
                {title}
            </h2>
            <FavouriteButton itemId={id} />
            </div>

      <p className="font-medium mt-1">
        {company}
      </p>

      <p className="text-text-secondary mt-2 break-words">
        {description}
      </p>

      <div className="flex items-center gap-2 mt-4 text-text-secondary">
        <MapPin size={18} aria-hidden="true" className="shrink-0" />
        <span>{location}</span>
      </div>

      <div className="flex items-center gap-2 mt-2 text-text-secondary">
        <BriefcaseBusiness size={18} aria-hidden="true" className="shrink-0" />
        <span>{employmentType}</span>
      </div>
    </Card>
  );
}
