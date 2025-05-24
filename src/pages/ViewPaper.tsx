import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Paper {
  id: string;
  title: string;
  subject: string;
  year: string;
  description?: string;
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

const ViewPaper = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPaper = async () => {
      try {
        setLoading(true);
        
        if (!paperId) {
          throw new Error("Paper ID is required");
        }
        
        const { data, error } = await supabase
          .from("papers")
          .select(`
            *,
            branches(name, code),
            semesters(number)
          `)
          .eq("id", paperId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error("Paper not found");
        }
        
        setPaper(data as Paper);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Could not load paper details. Please try again.";
        console.error("Error fetching paper:", error);
        toast({
          variant: "destructive",
          title: "Failed to load paper",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaper();
  }, [paperId, toast]);

  const handleDownload = () => {
    if (paper?.file_url) {
      window.open(paper.file_url, "_blank");
    } else {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "No file is available for this paper.",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && paper) {
      try {
        await navigator.share({
          title: paper.title,
          text: `Check out this question paper: ${paper.title} - ${paper.subject} (${paper.year})`,
          url: window.location.href,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast({
            variant: "destructive",
            title: "Share failed",
            description: "Could not share the paper. Please try again.",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Paper link has been copied to clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Paper Not Found</h1>
            <p className="text-gray-600 mb-8">The paper you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link 
              to={`/papers/${paper.branches.code}/${paper.semesters.number}`} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Papers
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{paper.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <p>Subject: {paper.subject}</p>
            <p>Year: {paper.year}</p>
            <p>Branch: {paper.branches.name}</p>
            <p>Semester: {paper.semesters.number}</p>
          </div>
        </div>
        
        {paper.description && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{paper.description}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Paper
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ViewPaper;