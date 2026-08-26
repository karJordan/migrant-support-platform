import { MapPin } from "lucide-react";

type ServiceCardProps = {
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
    <div className="border border-neutral/20 rounded-xl p-5 bg-white">
      <span className="text-sm text-primary font-medium">
        {category}
      </span>

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