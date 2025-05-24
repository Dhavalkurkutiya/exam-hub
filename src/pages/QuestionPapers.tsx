import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaperCard from "@/components/PaperCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Paper {
  id: string;
  title: string;
  subject: string;
  year: string;
  file_url: string;
  created_at: string;
  branch_id: string;
  semester_id: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  number: number;
  branch_id: string;
}

const QuestionPapers = () => {
  const { branchId, semesterId } = useParams<{ branchId: string; semesterId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [branchName, setBranchName] = useState("Loading...");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBranchAndPapers = async () => {
      try {
        setLoading(true);
        
        if (!branchId || !semesterId) {
          throw new Error("Branch ID and Semester ID are required");
        }
        
        // Fetch branch details
        const { data: branchData, error: branchError } = await supabase
          .from("branches")
          .select("*")
          .eq("code", branchId)
          .single();
          
        if (branchError) {
          throw branchError;
        }
        
        if (!branchData) {
          throw new Error("Branch not found");
        }
        
        setBranchName(branchData.name);
        
        // Fetch semester id
        const { data: semesterData, error: semesterError } = await supabase
          .from("semesters")
          .select("id")
          .eq("branch_id", branchData.id)
          .eq("number", parseInt(semesterId))
          .single();
          
        if (semesterError) {
          throw semesterError;
        }
        
        if (!semesterData) {
          throw new Error("Semester not found");
        }
        
        // Fetch papers for this branch and semester
        const { data: papersData, error: papersError } = await supabase
          .from("papers")
          .select("*")
          .eq("branch_id", branchData.id)
          .eq("semester_id", semesterData.id)
          .order("created_at", { ascending: false });
          
        if (papersError) {
          throw papersError;
        }
        
        setPapers(papersData || []);
        
        // Extract unique years and subjects
        const uniqueYears = [...new Set(papersData?.map(paper => paper.year) || [])];
        const uniqueSubjects = [...new Set(papersData?.map(paper => paper.subject) || [])];
        
        setYears(uniqueYears);
        setSubjects(uniqueSubjects);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Could not load papers. Please try again.";
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranchAndPapers();
  }, [branchId, semesterId, toast]);

  // Filter papers based on search query and filters
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = yearFilter === "all" || paper.year === yearFilter;
    const matchesSubject = subjectFilter === "all" || paper.subject === subjectFilter;
    
    return matchesSearch && matchesYear && matchesSubject;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link to={`/semester/${branchId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Semesters
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">
            {branchName} - Semester {semesterId}
          </h1>
          <p className="text-gray-600">Question Papers</p>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <SearchBar 
                onSearch={(query) => setSearchQuery(query)} 
                placeholder="Search by title or subject..." 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper, index) => (
                <PaperCard 
                  key={index} 
                  title={paper.title}
                  subject={paper.subject}
                  date={`${paper.year}`}
                  downloadUrl={paper.file_url || "#"}
                  viewUrl={`/view/${paper.id}`}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-lg text-gray-500">No papers found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setYearFilter("all");
                    setSubjectFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default QuestionPapers;