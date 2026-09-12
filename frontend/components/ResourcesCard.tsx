import Card from "@/components/ui/Card";
import { ExternalLink } from "lucide-react";

type ResourcesCardProps = {
  id: string | number;
  title: string;
  category: string;
  description: string;
  link: string;
};

export default function ResourcesCard({
  title,
  category,
  description,
  link,
}: ResourcesCardProps) {
  return (
    <Card hoverable>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm text-primary font-medium min-w-0 break-words">
          {category}
        </span>
      </div>

      <h2 className="heading-4 mt-2 break-words">
        {title}
      </h2>

      <p className="text-text-secondary mt-2 break-words">
        {description}
      </p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-4 text-primary hover:underline"
      >
        <ExternalLink size={18} />
        <span>Visit resource</span>
      </a>
    </Card>
  );
}
