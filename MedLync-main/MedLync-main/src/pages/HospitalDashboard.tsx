import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, UserPlus, LogIn, Stethoscope, Users, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  created_at: string;
}

// Demo doctors data
const DEMO_DOCTORS: Doctor[] = [
  { id: "doc-001", name: "Dr. Sarah Johnson", specialization: "Cardiologist", created_at: new Date().toISOString() },
  { id: "doc-002", name: "Dr. Michael Chen", specialization: "General Physician", created_at: new Date().toISOString() },
];

export default function HospitalDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [doctors, setDoctors] = useState<Doctor[]>(DEMO_DOCTORS);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpec, setNewDoctorSpec] = useState("");
  const [doctorUsername, setDoctorUsername] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [signingInDoctor, setSigningInDoctor] = useState(false);

  const hospitalName = user?.hospital_name || "City General Hospital";

  const handleAddDoctor = async () => {
    if (!newDoctorName.trim()) {
      toast({ title: "Enter doctor name", variant: "destructive" });
      return;
    }
    setAddingDoctor(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      name: newDoctorName.trim(),
      specialization: newDoctorSpec.trim() || undefined,
      created_at: new Date().toISOString()
    };
    
    setDoctors([...doctors, newDoctor]);
    setNewDoctorName("");
    setNewDoctorSpec("");
    setDoctorDialogOpen(false);
    toast({ title: "Doctor added successfully!" });
    setAddingDoctor(false);
  };

  const handleDoctorSignIn = async () => {
    if (!doctorUsername || !doctorPassword) {
      toast({ title: "Enter username and password", variant: "destructive" });
      return;
    }
    setSigningInDoctor(true);
    
    // Simulate API call - accept any credentials for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create doctor user
    const doctorUser = {
      id: `doctor-${Date.now()}`,
      name: doctors[0]?.name || "Doctor",
      email: `${doctorUsername}@medlync.com`,
      role: "doctor" as const,
      phone: "+1234567890",
      hospital_name: hospitalName,
    };
    
    localStorage.setItem("pharmalync_token", "demo-doctor-token");
    localStorage.setItem("pharmalync_user", JSON.stringify(doctorUser));
    setUser(doctorUser);
    
    toast({ title: "Signed in as Doctor!" });
    navigate("/dashboard/doctor");
    setSigningInDoctor(false);
    setSignInDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              {hospitalName}
            </h1>
            <p className="text-muted-foreground mt-1">Hospital Administration Dashboard</p>
          </div>
        </div>

        {/* Doctor Access Card - Main Feature */}
        <Card className="glass-card border-2 border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display flex items-center justify-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              Doctor Dashboard Access
            </CardTitle>
            <CardDescription className="text-base">
              Sign up new doctors or sign in to access the prescription system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Sign Up Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Sign Up Doctor</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Register a new doctor to your hospital. They will be able to create prescriptions after signing in.
                </p>
                <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gradient-primary text-primary-foreground">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register New Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Add New Doctor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Doctor Name *</Label>
                        <Input 
                          value={newDoctorName} 
                          onChange={(e) => setNewDoctorName(e.target.value)} 
                          placeholder="Dr. John Smith" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization</Label>
                        <Input 
                          value={newDoctorSpec} 
                          onChange={(e) => setNewDoctorSpec(e.target.value)} 
                          placeholder="Cardiologist" 
                        />
                      </div>
                      <Button 
                        onClick={handleAddDoctor} 
                        className="w-full gradient-primary text-primary-foreground" 
                        disabled={addingDoctor}
                      >
                        {addingDoctor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Doctor
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Sign In Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Sign In as Doctor</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Already registered? Sign in to access the doctor dashboard and create prescriptions.
                </p>
                <Dialog open={signInDialogOpen} onOpenChange={setSignInDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-2 border-primary/30 hover:bg-primary/5">
                      <LogIn className="h-4 w-4 mr-2" />
                      Doctor Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Doctor Sign In</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input 
                          value={doctorUsername} 
                          onChange={(e) => setDoctorUsername(e.target.value)} 
                          placeholder="doctor" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input 
                          type="password"
                          value={doctorPassword} 
                          onChange={(e) => setDoctorPassword(e.target.value)} 
                          placeholder="demo123" 
                        />
                      </div>
                      <Button 
                        onClick={handleDoctorSignIn} 
                        className="w-full gradient-primary text-primary-foreground" 
                        disabled={signingInDoctor}
                      >
                        {signingInDoctor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Sign In
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Demo: Use any username/password to sign in
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
                <p className="text-sm text-muted-foreground">Registered Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Active Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">Hospital Branch</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctors List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Hospital Doctors
            </CardTitle>
            <CardDescription>List of registered doctors in your hospital</CardDescription>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No doctors registered yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setDoctorDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Doctor
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doctor.name}</p>
                        {doctor.specialization && (
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDoctorUsername(doctor.name.toLowerCase().replace(/[^a-z]/g, ""));
                        setDoctorPassword("demo123");
                        setSignInDialogOpen(true);
                      }}
                    >
                      <LogIn className="h-3.5 w-3.5 mr-1" />
                      Sign In
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => {
                  // Quick sign in as first doctor
                  const doctorUser = {
                    id: doctors[0]?.id || "demo-doctor",
                    name: doctors[0]?.name || "Demo Doctor",
                    email: "doctor@medlync.com",
                    role: "doctor" as const,
                    phone: "+1234567890",
                    hospital_name: hospitalName,
                  };
                  localStorage.setItem("pharmalync_token", "demo-doctor-token");
                  localStorage.setItem("pharmalync_user", JSON.stringify(doctorUser));
                  setUser(doctorUser);
                  navigate("/dashboard/doctor");
                }}
              >
                <Stethoscope className="h-6 w-6 text-primary" />
                <span>Go to Prescription Dashboard</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setDoctorDialogOpen(true)}
              >
                <UserPlus className="h-6 w-6 text-success" />
                <span>Add New Doctor</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
