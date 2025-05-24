import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BranchManagement } from "@/components/admin/BranchManagement";
import { SemesterManagement } from "@/components/admin/SemesterManagement";
import { PaperManagement } from "@/components/admin/PaperManagement";
import { Branch, Semester } from "@/components/admin/types";

const AdminPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Branch state
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Semesters state
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedBranchForSemester, setSelectedBranchForSemester] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        
        const { data: userEmail } = await supabase.from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        // For simplicity, we're using email to determine admin status
        // In a real application, you would have a proper role system
        const isAdminUser = session.user.email === 'kurkutiyadhaval30@gmail.com'; // Replace with your admin check logic
        
        setIsAdmin(isAdminUser);
        
        if (!isAdminUser) {
          navigate('/');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access the admin panel."
          });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setBranches(data || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast({
          variant: "destructive",
          title: "Failed to load branches",
          description: "Could not load branches"
        });
      }
    };

    fetchBranches();
  }, [toast]);

  // Fetch semesters when a branch is selected
  useEffect(() => {
    if (selectedBranchForSemester) {
      const fetchSemesters = async () => {
        try {
          const { data, error } = await supabase
            .from('semesters')
            .select('*')
            .eq('branch_id', selectedBranchForSemester)
            .order('number');
          
          if (error) throw error;
          setSemesters(data || []);
        } catch (error) {
          console.error("Error fetching semesters:", error);
          toast({
            variant: "destructive",
            title: "Failed to load semesters",
            description: "Could not load semesters"
          });
        }
      };

      fetchSemesters();
    } else {
      setSemesters([]);
    }
  }, [selectedBranchForSemester, toast]);

  if (!isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="branches" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="semesters">Semesters</TabsTrigger>
            <TabsTrigger value="papers">Papers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="branches">
            <BranchManagement 
              branches={branches}
              setBranches={setBranches}
            />
          </TabsContent>
          
          <TabsContent value="semesters">
            <SemesterManagement 
              branches={branches}
              semesters={semesters}
              setSemesters={setSemesters}
              selectedBranchForSemester={selectedBranchForSemester}
              setSelectedBranchForSemester={setSelectedBranchForSemester}
            />
          </TabsContent>
          
          <TabsContent value="papers">
            <PaperManagement />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;
