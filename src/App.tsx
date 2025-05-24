import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BranchSelect from "./pages/BranchSelect";
import SemesterSelect from "./pages/SemesterSelect";
import QuestionPapers from "./pages/QuestionPapers";
import SearchPapers from "./pages/SearchPapers";
import ViewPaper from "./pages/ViewPaper";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadPaper from "./pages/UploadPaper";
import Admin from "./pages/Admin"; // Add this line
import Profile from './pages/Profile';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/branches" element={<BranchSelect />} />
            <Route path="/semester/:branchId" element={<SemesterSelect />} />
            <Route path="/papers/:branchId/:semesterId" element={<QuestionPapers />} />
            <Route path="/search" element={<SearchPapers />} />
            <Route path="/view/:paperId" element={<ViewPaper />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<UploadPaper />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;