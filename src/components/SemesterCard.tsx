
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SemesterCardProps {
  semesterNumber: number;
  title: string;
  paperCount: number;
  url: string;
}

const SemesterCard = ({ semesterNumber, title, paperCount, url }: SemesterCardProps) => {
  // Generate a color based on semester number
  const getColor = (semNum: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-green-100 text-green-600",
      "bg-amber-100 text-amber-600",
      "bg-red-100 text-red-600",
      "bg-indigo-100 text-indigo-600",
      "bg-pink-100 text-pink-600",
      "bg-cyan-100 text-cyan-600",
    ];
    return colors[(semNum - 1) % colors.length];
  };
  
  return (
    <Link
      to={url}
      className="block p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 bg-white hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          "w-16 h-16 flex items-center justify-center rounded-full mb-4",
          getColor(semesterNumber)
        )}>
          {semesterNumber}
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{paperCount} Papers</p>
      </div>
    </Link>
  );
};

export default SemesterCard;
