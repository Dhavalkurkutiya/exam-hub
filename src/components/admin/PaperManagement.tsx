import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PaperManagement = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Papers</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8">
          Papers can be managed from the main paper listings page. Go to branches, select a semester, and manage papers there.
        </p>
        <div className="text-center">
          <Button onClick={() => navigate('/branches')}>
            Go to Branches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 