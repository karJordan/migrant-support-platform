import Card from "@/components/ui/Card";
import { MapPin } from "lucide-react";

type ServiceCardProps = {
  id: string | number;
  name: string;
  category: string;
  description: string;
  location: string;
};

export default function ServiceCard({
  name,
  category,
  description,
  location,
}: ServiceCardProps) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm text-primary font-medium min-w-0 break-words">
          {category}
        </span>
      </div>

      <h2 className="heading-4 mt-2 break-words">
        {name}
      </h2>

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
