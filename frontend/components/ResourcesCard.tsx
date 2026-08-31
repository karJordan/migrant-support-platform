import { ExternalLink } from "lucide-react";

type ResourcesCardProps = {
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
    <div className="border border-neutral/20 rounded-xl p-5 bg-white">
      <span className="text-sm text-primary font-medium">
        {category}
      </span>

      <h2 className="text-xl font-semibold mt-2">
        {title}
      </h2>

      <p className="text-neutral mt-2">
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
    </div>
  );
}