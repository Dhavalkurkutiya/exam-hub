import { useState, useEffect } from "react";
import { Code, BookOpen, FileText, Beaker } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BranchCard from "@/components/BranchCard";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BranchSelect = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Icons mapping for branches
  const getIcon = (code: string) => {
    const icons: {[key: string]: React.ReactNode} = {
      "cse": <Code className="h-5 w-5" />,
      "bcs": <FileText className="h-5 w-5" />,
      "ece": <BookOpen className="h-5 w-5" />,
      "pharma": <Beaker className="h-5 w-5" />,
      "ee": <BookOpen className="h-5 w-5" />,
      "ce": <BookOpen className="h-5 w-5" />,
      "me": <BookOpen className="h-5 w-5" />,
      "mechanical": <BookOpen className="h-5 w-5" />,
      "civil": <BookOpen className="h-5 w-5" />,
      "electrical": <BookOpen className="h-5 w-5" />
    };
    
    return icons[code] || <BookOpen className="h-5 w-5" />;
  };
  
  // Color mapping for branches
  const getColor = (code: string) => {
    const colors: {[key: string]: string} = {
      "cse": "bg-blue-100 text-blue-700",
      "bcs": "bg-purple-100 text-purple-700",
      "ece": "bg-indigo-100 text-indigo-700",
      "pharma": "bg-green-100 text-green-700",
      "ee": "bg-yellow-100 text-yellow-700",
      "ce": "bg-red-100 text-red-700",
      "me": "bg-orange-100 text-orange-700",
      "mechanical": "bg-orange-100 text-orange-700",
      "civil": "bg-red-100 text-red-700",
      "electrical": "bg-yellow-100 text-yellow-700"
    };
    
    return colors[code] || "bg-gray-100 text-gray-700";
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .order("name");
          
        if (error) {
          throw error;
        }
        
        const formattedBranches = data.map(branch => ({
          title: branch.name,
          shortName: branch.code.toUpperCase(),
          description: branch.description || `Question papers for ${branch.name}`,
          color: getColor(branch.code),
          icon: getIcon(branch.code),
          url: `/semester/${branch.code}`,
          id: branch.id
        }));
        
        setBranches(formattedBranches);
      } catch (error: any) {
        console.error("Error fetching branches:", error);
        toast({
          variant: "destructive",
          title: "Failed to load branches",
          description: error.message || "Could not load branches. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranches();
  }, [toast]);
  
  const filteredBranches = branches.filter(branch => 
    branch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    branch.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Select Your Branch</h1>
          <p className="text-gray-600 mb-8">
            Choose your branch to find semester-wise question papers
          </p>
          
          <div className="max-w-md mx-auto mb-10">
            <SearchBar 
              value={searchQuery}
              onSearch={(query) => setSearchQuery(query)} 
              placeholder="Search for your branch..." 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch, index) => (
                <BranchCard key={index} {...branch} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-gray-500">No branches found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BranchSelect;