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
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      setIsLoggedIn(isAuthenticated);

      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "You need to be logged in to access this page.",
        });
        navigate("/login");
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthenticated = !!session;
        setIsLoggedIn(isAuthenticated);
        if (!isAuthenticated) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "You need to be logged in to access this page.",
          });
          navigate("/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoggedIn === null) {
    // Still checking auth state
    return null;
  }

  return isLoggedIn ? <>{children}</> : null;
};

export default ProtectedRoute;