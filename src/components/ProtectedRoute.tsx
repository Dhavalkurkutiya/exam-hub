import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const handleAuthChange = (isAuthenticated: boolean) => {
      setIsLoggedIn(isAuthenticated);
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication required", 
          description: "You need to be logged in to access this page."
        });
        navigate("/login");
      }
    };

    const checkInitialAuth = async () => {
      const { data } = await supabase.auth.getSession();
      handleAuthChange(!!data.session);
    };

    checkInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => handleAuthChange(!!session)
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (isLoggedIn === null) return null;

  return isLoggedIn ? <>{children}</> : null;
};

export default ProtectedRoute;