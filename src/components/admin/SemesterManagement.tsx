import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Branch, Semester } from "./types";
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

interface SemesterManagementProps {
  branches: Branch[];
  semesters: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
  selectedBranchForSemester: string | null;
  setSelectedBranchForSemester: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SemesterManagement = ({
  branches,
  semesters,
  setSemesters,
  selectedBranchForSemester,
  setSelectedBranchForSemester
}: SemesterManagementProps) => {
  const { toast } = useToast();
  const [newSemesterNumber, setNewSemesterNumber] = useState<number | ''>('');
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);

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
      
      setSemesters([...semesters, data[0] as Semester]);
      setNewSemesterNumber('');
      
      toast({
        title: "Semester added",
        description: "Semester has been added successfully"
      });
    } catch (error) {
      console.error("Error adding semester:", error);
      toast({
        variant: "destructive",
        title: "Failed to add semester",
        description: "Could not add semester"
      });
    }
  };

  const handleDeleteSemester = async () => {
    if (!semesterToDelete) return;
    
    try {
      // Delete papers associated with this semester first
      const { error: papersError } = await supabase
        .from('papers')
        .delete()
        .eq('semester_id', semesterToDelete);
      
      if (papersError) throw papersError;
      
      // Now delete the semester itself
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterToDelete);
      
      if (error) throw error;
      
      setSemesters(semesters.filter(s => s.id !== semesterToDelete));
      setSemesterToDelete(null);
      
      toast({
        title: "Semester deleted",
        description: "Semester has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete semester",
        description: "Could not delete semester"
      });
    }
  };

  return (
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
                            <Button size="sm" variant="outline" onClick={() => setSemesterToDelete(semester.id)}>
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
  );
}; 