import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Save,
  X 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

const AdminPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Branch state
  const [branches, setBranches] = useState<any[]>([]);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    description: ""
  });
  
  // Delete confirmation state
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Semesters state
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedBranchForSemester, setSelectedBranchForSemester] = useState<string | null>(null);
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);

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
      } catch (error: any) {
        console.error("Error fetching branches:", error);
        toast({
          variant: "destructive",
          title: "Failed to load branches",
          description: error.message || "Could not load branches"
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
        } catch (error: any) {
          console.error("Error fetching semesters:", error);
          toast({
            variant: "destructive",
            title: "Failed to load semesters",
            description: error.message || "Could not load semesters"
          });
        }
      };

      fetchSemesters();
    } else {
      setSemesters([]);
    }
  }, [selectedBranchForSemester, toast]);

  // Branch CRUD operations
  const handleAddBranch = async () => {
    try {
      if (!newBranch.name || !newBranch.code) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Name and code are required"
        });
        return;
      }

      const { data, error } = await supabase
        .from('branches')
        .insert([newBranch])
        .select();
      
      if (error) throw error;
      
      setBranches([...branches, data[0]]);
      setNewBranch({ name: "", code: "", description: "" });
      
      toast({
        title: "Branch added",
        description: "Branch has been added successfully"
      });
    } catch (error: any) {
      console.error("Error adding branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to add branch",
        description: error.message || "Could not add branch"
      });
    }
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch({ ...branch });
  };

  const handleUpdateBranch = async () => {
    try {
      if (!editingBranch || !editingBranch.name || !editingBranch.code) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Name and code are required"
        });
        return;
      }

      const { data, error } = await supabase
        .from('branches')
        .update({
          name: editingBranch.name,
          code: editingBranch.code,
          description: editingBranch.description
        })
        .eq('id', editingBranch.id)
        .select();
      
      if (error) throw error;
      
      setBranches(branches.map(b => b.id === editingBranch.id ? data[0] : b));
      setEditingBranch(null);
      
      toast({
        title: "Branch updated",
        description: "Branch has been updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to update branch",
        description: error.message || "Could not update branch"
      });
    }
  };

  const confirmDeleteBranch = (id: string) => {
    setBranchToDelete(id);
  };

  // Fixed handleDeleteBranch function to properly delete from the database
  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    
    try {
      console.log("Deleting branch with ID:", branchToDelete);
      
      // Delete all semesters associated with this branch first
      const { error: semestersError } = await supabase
        .from('semesters')
        .delete()
        .eq('branch_id', branchToDelete);
      
      if (semestersError) {
        console.error("Error deleting associated semesters:", semestersError);
        throw semestersError;
      }
      
      // Now delete the branch itself
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchToDelete);
      
      if (error) {
        console.error("Error deleting branch:", error);
        throw error;
      }
      
      // Update local state only after successful database deletion
      setBranches(branches.filter(b => b.id !== branchToDelete));
      setBranchToDelete(null);
      
      toast({
        title: "Branch deleted",
        description: "Branch has been deleted successfully from the database"
      });
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete branch",
        description: error.message || "Could not delete branch from the database"
      });
    }
  };

  // Semester CRUD operations
  const [newSemesterNumber, setNewSemesterNumber] = useState<number | ''>('');

  const handleAddSemester = async () => {
    try {
      if (!selectedBranchForSemester || newSemesterNumber === '') {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Branch and semester number are required"
        });
        return;
      }

      const { data, error } = await supabase
        .from('semesters')
        .insert([{
          branch_id: selectedBranchForSemester,
          number: newSemesterNumber
        }])
        .select();
      
      if (error) throw error;
      
      setSemesters([...semesters, data[0]]);
      setNewSemesterNumber('');
      
      toast({
        title: "Semester added",
        description: "Semester has been added successfully"
      });
    } catch (error: any) {
      console.error("Error adding semester:", error);
      toast({
        variant: "destructive",
        title: "Failed to add semester",
        description: error.message || "Could not add semester"
      });
    }
  };

  const confirmDeleteSemester = (id: string) => {
    setSemesterToDelete(id);
  };

  // Fixed semester deletion function to properly delete from database
  const handleDeleteSemester = async () => {
    if (!semesterToDelete) return;
    
    try {
      console.log("Deleting semester with ID:", semesterToDelete);
      
      // Delete papers associated with this semester first to avoid foreign key constraints
      const { error: papersError } = await supabase
        .from('papers')
        .delete()
        .eq('semester_id', semesterToDelete);
      
      if (papersError) {
        console.error("Error deleting associated papers:", papersError);
        throw papersError;
      }
      
      // Now delete the semester itself
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterToDelete);
      
      if (error) {
        console.error("Error deleting semester:", error);
        throw error;
      }
      
      // Update local state only after successful database deletion
      setSemesters(semesters.filter(s => s.id !== semesterToDelete));
      setSemesterToDelete(null);
      
      toast({
        title: "Semester deleted",
        description: "Semester has been deleted successfully from the database"
      });
    } catch (error: any) {
      console.error("Error deleting semester:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete semester",
        description: error.message || "Could not delete semester from the database"
      });
    }
  };

  if (!isAdmin) {
    return null; // Loading or redirected
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
          
          {/* Branches Tab */}
          <TabsContent value="branches">
            <Card>
              <CardHeader>
                <CardTitle>Manage Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input 
                      id="branchName" 
                      placeholder="Computer Science" 
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input 
                      id="branchCode" 
                      placeholder="cse" 
                      value={newBranch.code}
                      onChange={(e) => setNewBranch({...newBranch, code: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchDesc">Description (Optional)</Label>
                    <Input 
                      id="branchDesc" 
                      placeholder="Description" 
                      value={newBranch.description || ""}
                      onChange={(e) => setNewBranch({...newBranch, description: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddBranch} className="mb-6">
                  <Plus className="w-4 h-4 mr-2" /> Add Branch
                </Button>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No branches found
                          </TableCell>
                        </TableRow>
                      ) : (
                        branches.map((branch) => (
                          <TableRow key={branch.id}>
                            {editingBranch && editingBranch.id === branch.id ? (
                              <>
                                <TableCell>
                                  <Input 
                                    value={editingBranch.name} 
                                    onChange={(e) => setEditingBranch({...editingBranch, name: e.target.value})}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={editingBranch.code} 
                                    onChange={(e) => setEditingBranch({...editingBranch, code: e.target.value})}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input 
                                    value={editingBranch.description || ""} 
                                    onChange={(e) => setEditingBranch({...editingBranch, description: e.target.value})}
                                  />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button size="sm" variant="outline" onClick={handleUpdateBranch}>
                                    <Save className="w-4 h-4 mr-1" /> Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingBranch(null)}>
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>{branch.name}</TableCell>
                                <TableCell>{branch.code}</TableCell>
                                <TableCell>{branch.description || "-"}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditBranch(branch)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" onClick={() => confirmDeleteBranch(branch.id)}>
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this branch? This will also delete all associated semesters and papers.
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setBranchToDelete(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteBranch}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Semesters Tab */}
          <TabsContent value="semesters">
            <Card>
              <CardHeader>
                <CardTitle>Manage Semesters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branchSelect">Select Branch</Label>
                    <select 
                      id="branchSelect"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedBranchForSemester || ""}
                      onChange={(e) => setSelectedBranchForSemester(e.target.value || null)}
                    >
                      <option value="">Select a branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="semesterNumber">Semester Number</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="semesterNumber" 
                        type="number"
                        min="1"
                        placeholder="1" 
                        value={newSemesterNumber}
                        onChange={(e) => setNewSemesterNumber(e.target.value ? parseInt(e.target.value) : '')}
                      />
                      <Button onClick={handleAddSemester} disabled={!selectedBranchForSemester}>
                        <Plus className="w-4 h-4 mr-2" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedBranchForSemester ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Semester Number</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semesters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                              No semesters found for this branch
                            </TableCell>
                          </TableRow>
                        ) : (
                          semesters.map((semester) => (
                            <TableRow key={semester.id}>
                              <TableCell>Semester {semester.number}</TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => confirmDeleteSemester(semester.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this semester? This will also delete all associated papers.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setSemesterToDelete(null)}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={handleDeleteSemester}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a branch to manage its semesters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Papers Tab */}
          <TabsContent value="papers">
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
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;
