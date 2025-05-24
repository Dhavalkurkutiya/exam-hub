import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PaperCard from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Paper {
  id: string;
  title: string;
  subject: string;
  year: string;
  description: string;
  file_url: string;
  created_at: string;
  branches: {
    name: string;
    code: string;
  };
  semesters: {
    number: number;
  };
}

const SearchPapers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const { toast } = useToast();
  
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
  };
  
  useEffect(() => {
    const searchPapers = async () => {
      if (!query.trim()) {
        setPapers([]);
        setResultsCount(0);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error, count } = await supabase
          .from("papers")
          .select(`
            *,
            branches: branch_id(*),
            semesters: semester_id(*)
          `)
          .or(`title.ilike.%${query}%,subject.ilike.%${query}%,description.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        setPapers(data || []);
        setResultsCount(count || 0);
      } catch (error: any) {
        console.error("Search error:", error);
        toast({
          variant: "destructive",
          title: "Search failed",
          description: error.message || "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    searchPapers();
  }, [query, toast]);
  
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
          
          <h1 className="text-3xl font-bold mb-6">Search Question Papers</h1>
          
          <SearchBar 
            value={query} 
            onSearch={handleSearch}
            placeholder="Search by title, subject, or keywords..." 
          />
          
          {query && !loading && (
            <p className="mt-4 text-gray-500">
              {resultsCount} results for "{query}"
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : papers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                title={paper.title}
                subject={paper.subject}
                date={format(new Date(paper.created_at), "MMM d, yyyy")}
                downloadUrl={paper.file_url}
                viewUrl={`/view/${paper.id}`}
                branchName={paper.branches?.name}
                semesterNumber={paper.semesters?.number}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-gray-500">
              Try searching with different keywords or browse by branch
            </p>
          </div>
        ) : null}
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchPapers;