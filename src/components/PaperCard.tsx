import React from "react";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface PaperCardProps {
  title: string;
  subject: string;
  date: string;
  downloadUrl: string;
  viewUrl: string;
  branchName?: string;
  semesterNumber?: number;
}

const PaperCard: React.FC<PaperCardProps> = ({
  title,
  subject,
  date,
  downloadUrl,
  viewUrl,
  branchName,
  semesterNumber,
}) => {
  return (
    <Card className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 border border-gray-100">
      <CardHeader className="space-y-2 p-4">
        <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 hover:line-clamp-none">
          {title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
          <span className="font-medium">{subject}</span>
          <div className="h-1 w-1 rounded-full bg-gray-300" />
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
            <span>{date}</span>
          </div>
          
          {branchName && (
            <>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                {branchName}
              </Badge>
            </>
          )}
          
          {semesterNumber !== undefined && (
            <>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100">
                Sem {semesterNumber}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-px bg-gray-100" />
      </CardContent>
      
      <CardFooter className="flex gap-2 p-3">
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-200" 
          asChild
        >
          <Link to={viewUrl} className="flex items-center justify-center gap-1.5">
            <ExternalLink className="h-3 w-3" />
            <span>View</span>
          </Link>
        </Button>
        <Button 
          variant="default"
          size="sm"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
          asChild
        >
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            download
            className="flex items-center justify-center gap-1.5"
          >
            <Download className="h-3 w-3" />
            <span>Download</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaperCard;