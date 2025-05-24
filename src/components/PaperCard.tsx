import React from "react";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-2 gap-2">
          <span>{subject}</span>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {date}
          </div>
          
          {branchName && (
            <>
              <span className="hidden sm:inline">•</span>
              <Badge variant="outline" className="font-normal">
                {branchName}
              </Badge>
            </>
          )}
          
          {semesterNumber !== undefined && (
            <>
              <span className="hidden sm:inline">•</span>
              <Badge variant="outline" className="font-normal">
                Semester {semesterNumber}
              </Badge>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Existing content */}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-4">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <a href={viewUrl} className="flex items-center justify-center gap-1">
            <ExternalLink className="h-4 w-4" /> View
          </a>
        </Button>
        <Button variant="default" size="sm" className="flex-1" asChild>
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            download
            className="flex items-center justify-center gap-1"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaperCard;