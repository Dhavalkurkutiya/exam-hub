
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SemesterCard from "@/components/SemesterCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SemesterSelect = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [branchName, setBranchName] = useState("Loading...");
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBranchAndSemesters = async () => {
      try {
        setLoading(true);
        
        // Fetch branch details
        const { data: branchData, error: branchError } = await supabase
          .from("branches")
          .select("*")
          .eq("code", branchId)
          .single();
          
        if (branchError) {
          throw branchError;
        }
        
        setBranchName(branchData.name);
        
        // Fetch semesters for this branch
        const { data: semestersData, error: semestersError } = await supabase
          .from("semesters")
          .select("id, number")
          .eq("branch_id", branchData.id)
          .order("number");
          
        if (semestersError) {
          throw semestersError;
        }
        
        // For each semester, get the paper count
        const formattedSemesters = await Promise.all(
          semestersData.map(async (semester) => {
            // Count papers for this specific semester
            const { count, error: countError } = await supabase
              .from("papers")
              .select("*", { count: 'exact', head: true })
              .eq("branch_id", branchData.id)
              .eq("semester_id", semester.id);
            
            if (countError) {
              console.error("Error counting papers:", countError);
            }
            
            let title;
            switch(semester.number) {
              case 1: title = "1st Semester"; break;
              case 2: title = "2nd Semester"; break;
              case 3: title = "3rd Semester"; break;
              default: title = `${semester.number}th Semester`;
            }
            
            return {
              semesterNumber: semester.number,
              title,
              paperCount: count || 0,
              url: `/papers/${branchId}/${semester.number}`,
              id: semester.id
            };
          })
        );
        
        setSemesters(formattedSemesters);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: error.message || "Could not load branch and semesters. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (branchId) {
      fetchBranchAndSemesters();
    }
  }, [branchId, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to="/branches" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Branches
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{branchName}</h1>
          <p className="text-gray-600">Select a semester to view question papers</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {semesters.map((semester, index) => (
              <SemesterCard key={index} {...semester} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SemesterSelect;