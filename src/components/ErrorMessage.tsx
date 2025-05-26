
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = "Error", 
  description, 
  onRetry 
}) => {
  return (
    <div className="py-10">
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {description}
          {onRetry && (
            <button 
              onClick={onRetry}
              className="block mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ErrorMessage;