import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signup, uploadProfilePhoto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Loader2, Upload, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const computedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: "Please select a role", variant: "destructive" });
      return;
    }
    if (role === "doctorzz" && !hospitalName) {
      toast({ title: "Hospital name is required", variant: "destructive" });
      return;
    }
    if (role === "pharmacy" && !pharmacyName) {
      toast({ title: "Pharmacy name is required", variant: "destructive" });
      return;
    }
    if (role === "patient" && !dateOfBirth) {
      toast({ title: "Date of birth is required", variant: "destructive" });
      return;
    }
    if (role === "patient" && computedAge !== null && computedAge < 18) {
      toast({ title: "Minors must be added through a parent account", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let profile_photo_url: string | undefined;
      if (profilePhoto) {
        profile_photo_url = await uploadProfilePhoto(profilePhoto);
      }

      const { user } = await signup({
        name, email, password, role, phone,
        hospital_name: role === "doctor" ? hospitalName : undefined,
        pharmacy_name: role === "pharmacy" ? pharmacyName : undefined,
        date_of_birth: role === "patient" ? dateOfBirth : undefined,
        profile_photo_url,
      });
      setUser(user);
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      toast({ title: "Signup failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Pill className="h-8 w-8 text-primary" />
          <span className="text-2xl font-display font-bold gradient-text">MedLync</span>
        </div>
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Create account</CardTitle>
            <CardDescription>Join MedLync as a Doctor, Patient, or Pharmacy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" required />
              </div>

              {role === "doctor" && (
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital Name</Label>
                  <Input id="hospital" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="City General Hospital" required />
                </div>
              )}

              {role === "pharmacy" && (
                <div className="space-y-2">
                  <Label htmlFor="pharmacy">Pharmacy Name</Label>
                  <Input id="pharmacy" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} placeholder="HealthFirst Pharmacy" required />
                </div>
              )}

              {role === "patient" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required max={new Date().toISOString().split("T")[0]} />
                    {computedAge !== null && (
                      <p className="text-sm text-muted-foreground">Age: <span className="font-semibold text-foreground">{computedAge} years</span></p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border-2 border-primary" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                          <UserIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors text-sm">
                          <Upload className="h-4 w-4" /> Upload Photo
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
