import { MapPin } from "lucide-react";
import SaveButton from "@/components/SaveButton";

type ServiceCardProps = {
  id: string | number;
  name: string;
  category: string;
  description: string;
  location: string;
};

export default function ServiceCard({
  id,
  name,
  category,
  description,
  location,
}: ServiceCardProps) {
  return (
    <div className="border border-neutral/20 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm text-primary font-medium">
          {category}
        </span>
        <SaveButton 
          itemType="service" 
          itemId={id} 
        />
      </div>

      <h2 className="text-xl font-semibold mt-2">
        {name}
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