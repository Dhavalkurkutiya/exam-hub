import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Branch, NewBranch } from "./types";
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

interface BranchManagementProps {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
}

export const BranchManagement = ({ branches, setBranches }: BranchManagementProps) => {
  const { toast } = useToast();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState<NewBranch>({
    name: "",
    code: "",
    description: ""
  });
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

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
      
      setBranches([...branches, data[0] as Branch]);
      setNewBranch({ name: "", code: "", description: "" });
      
      toast({
        title: "Branch added",
        description: "Branch has been added successfully"
      });
    } catch (error) {
      console.error("Error adding branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to add branch",
        description: "Could not add branch"
      });
    }
  };

  const handleEditBranch = (branch: Branch) => {
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
      
      setBranches(branches.map(b => b.id === editingBranch.id ? data[0] as Branch : b));
      setEditingBranch(null);
      
      toast({
        title: "Branch updated",
        description: "Branch has been updated successfully"
      });
    } catch (error) {
      console.error("Error updating branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to update branch",
        description: "Could not update branch"
      });
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    
    try {
      // Delete all semesters associated with this branch first
      const { error: semestersError } = await supabase
        .from('semesters')
        .delete()
        .eq('branch_id', branchToDelete);
      
      if (semestersError) throw semestersError;
      
      // Now delete the branch itself
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchToDelete);
      
      if (error) throw error;
      
      setBranches(branches.filter(b => b.id !== branchToDelete));
      setBranchToDelete(null);
      
      toast({
        title: "Branch deleted",
        description: "Branch has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete branch",
        description: "Could not delete branch"
      });
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Manage Branches</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branchName" className="text-sm sm:text-base">Branch Name</Label>
            <Input 
              id="branchName" 
              placeholder="Computer Science" 
              value={newBranch.name}
              onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchCode" className="text-sm sm:text-base">Branch Code</Label>
            <Input 
              id="branchCode" 
              placeholder="cse" 
              value={newBranch.code}
              onChange={(e) => setNewBranch({...newBranch, code: e.target.value})}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branchDesc" className="text-sm sm:text-base">Description (Optional)</Label>
            <Input 
              id="branchDesc" 
              placeholder="Description" 
              value={newBranch.description}
              onChange={(e) => setNewBranch({...newBranch, description: e.target.value})}
              className="w-full"
            />
          </div>
        </div>
        <Button onClick={handleAddBranch} className="mb-6 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Branch
        </Button>

        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[600px]">
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
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={editingBranch.code} 
                            onChange={(e) => setEditingBranch({...editingBranch, code: e.target.value})}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={editingBranch.description || ""} 
                            onChange={(e) => setEditingBranch({...editingBranch, description: e.target.value})}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={handleUpdateBranch} className="w-full sm:w-auto mb-2 sm:mb-0">
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingBranch(null)} className="w-full sm:w-auto">
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="break-words">{branch.name}</TableCell>
                        <TableCell className="break-words">{branch.code}</TableCell>
                        <TableCell className="break-words">{branch.description || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBranch(branch)} className="w-full sm:w-auto mb-2 sm:mb-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setBranchToDelete(branch.id)} className="w-full sm:w-auto">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] max-w-md sm:w-full">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this branch? This will also delete all associated semesters and papers.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel onClick={() => setBranchToDelete(null)} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteBranch} className="w-full sm:w-auto">Delete</AlertDialogAction>
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
  );
};