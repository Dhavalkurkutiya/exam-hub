import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BranchCardProps {
  title: string;
  shortName: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  url: string;
}

const BranchCard = ({ title, shortName, description, color, icon, url }: BranchCardProps) => {
  return (
    <Link
      to={url}
      className={cn(
        "branch-card block p-6 rounded-lg shadow-md hover:shadow-lg",
        "border border-gray-200 bg-white",
        "transition-all duration-300"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:space-x-4 space-y-4 sm:space-y-0">
        <div className={cn("p-3 rounded-md self-center sm:self-auto", color)}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
          <p className="text-xs text-gray-500 mb-2 truncate">{shortName}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default BranchCard;
