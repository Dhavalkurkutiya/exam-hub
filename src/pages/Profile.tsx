
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, FileText, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    phone: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // First try to get the profile with all columns
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one with available columns
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || null,
                ...(session.user.email && { email: session.user.email }),
              }
            ])
            .select("*")
            .single();

          if (insertError) {
            throw insertError;
          }
          
          // Create a complete profile object with default values
          const completeProfile: ProfileData = {
            id: newProfile.id,
            full_name: newProfile.full_name || null,
            email: (newProfile as any).email || session.user.email || null,
            avatar_url: newProfile.avatar_url || null,
            bio: (newProfile as any).bio || null,
            phone: (newProfile as any).phone || null,
            created_at: newProfile.created_at,
            updated_at: (newProfile as any).updated_at || null,
          };
          
          setProfile(completeProfile);
          setFormData({
            full_name: completeProfile.full_name || "",
            bio: completeProfile.bio || "",
            phone: completeProfile.phone || "",
          });
        } else {
          throw error;
        }
      } else {
        // Create a complete profile object with default values for missing columns
        const completeProfile: ProfileData = {
          id: data.id,
          full_name: data.full_name || null,
          email: (data as any).email || session.user.email || null,
          avatar_url: data.avatar_url || null,
          bio: (data as any).bio || null,
          phone: (data as any).phone || null,
          created_at: data.created_at,
          updated_at: (data as any).updated_at || null,
        };
        
        setProfile(completeProfile);
        setFormData({
          full_name: completeProfile.full_name || "",
          bio: completeProfile.bio || "",
          phone: completeProfile.phone || "",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Failed to load profile",
        description: error.message || "Could not load your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setUpdating(true);
    try {
      // Prepare update data with only the columns that exist
      const updateData: any = {
        full_name: formData.full_name,
        updated_at: new Date().toISOString(),
      };

      // Try to update bio and phone if they exist in the database
      try {
        updateData.bio = formData.bio;
        updateData.phone = formData.phone;
      } catch (e) {
        // These columns might not exist yet
        console.log("Bio/phone columns not available yet");
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        bio: formData.bio,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      } : null);

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.message || "Could not update your profile. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <p className="text-gray-600 mb-4">We couldn't load your profile.</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name 
                      ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : profile.email?.[0]?.toUpperCase() || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">User Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 p-3 border rounded-lg">
                      {profile.full_name || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 p-3 border rounded-lg">
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself"
                      className="resize-none h-24"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 p-3 border rounded-lg min-h-[96px]">
                      {profile.bio || "No bio provided"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={updating}
                      className="flex-1"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: profile.full_name || "",
                          bio: profile.bio || "",
                          phone: profile.phone || "",
                        });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;