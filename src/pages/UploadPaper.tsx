import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { v4 as uuidv4 } from 'uuid';

const UploadPaper = () => {
  const [title, setTitle] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch branches and semesters
  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase.from("branches").select("*");
      if (error) {
        console.error("Error fetching branches:", error);
        toast({
          variant: "destructive",
          title: "Error fetching branches",
          description: error.message,
        });
      } else {
        setBranches(data || []);
      }
    };

    fetchBranches();
  }, [toast]);

  // Fetch semesters when branch is selected
  useEffect(() => {
    if (branch) {
      const fetchSemesters = async () => {
        const { data, error } = await supabase
          .from("semesters")
          .select("*")
          .eq("branch_id", branch);
        if (error) {
          console.error("Error fetching semesters:", error);
          toast({
            variant: "destructive",
            title: "Error fetching semesters",
            description: error.message,
          });
        } else {
          setSemesters(data || []);
        }
      };

      fetchSemesters();
    } else {
      setSemesters([]);
    }
  }, [branch, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file only.",
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 10MB.",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "File required",
        description: "Please upload a PDF file of the question paper.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("You must be logged in to upload papers.");
      }
      
      // 2. Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("Uploading file to papers bucket:", filePath);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('papers')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }
      
      console.log("Upload successful:", uploadData);
      
      // 3. Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(filePath);
      
      // 4. Save the paper details to the database
      const { error: insertError } = await supabase
        .from('papers')
        .insert({
          title,
          branch_id: branch,
          semester_id: semester,
          subject,
          year,
          description,
          file_url: publicUrl,
          uploaded_by: session.user.id
        });
      
      if (insertError) {
        throw new Error(`Failed to save paper details: ${insertError.message}`);
      }
      
      toast({
        title: "Upload successful",
        description: "Your question paper has been uploaded successfully.",
      });
      
      navigate("/papers/" + branch + "/" + semester);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error?.message || "An error occurred during upload. Please try again.",
      });
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container max-w-2xl mx-auto py-10 px-4">
        <div className="flex flex-col space-y-6 items-center text-center mb-8">
          <div className="bg-purple-100 p-3 rounded-full">
            <Upload className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold">Upload Question Paper</h1>
          <p className="text-gray-500">Share question papers with your fellow students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Paper Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Mid-term Examination 2023"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select 
                onValueChange={setBranch} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                onValueChange={setSemester} 
                required
                disabled={!branch}
              >
                <SelectTrigger>
                  <SelectValue placeholder={branch ? "Select semester" : "Select branch first"} />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Examination Year</Label>
              <Input
                id="year"
                type="text"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Data Structures"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about the question paper..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File (PDF)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Please upload files in PDF format only (max 10MB)
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Question Paper
              </>
            )}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default UploadPaper;