import { MapPin, BriefcaseBusiness } from "lucide-react";
import SaveButton from "@/components/SaveButton";

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
    <div className="border border-neutral/20 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between">
            <span className="text-sm text-primary font-medium">
                {title}
            </span>
            <SaveButton itemType="job" itemId={id} />
            </div>

      <p className="font-medium mt-1">
        {company}
      </p>

      <p className="text-neutral mt-2">
        {description}
      </p>

      <div className="flex items-center gap-2 mt-4 text-neutral">
        <MapPin size={18} />
        <span>{location}</span>
      </div>

      <div className="flex items-center gap-2 mt-2 text-neutral">
        <BriefcaseBusiness size={18} />
        <span>{employmentType}</span>
      </div>
    </div>
  );
}