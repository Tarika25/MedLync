import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Loader2, Building2, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo credentials
const DEMO_CREDENTIALS = {
  username: "hospital",
  password: "demo123"
};

interface HospitalUser {
  id: string;
  name: string;
  hospital_name: string;
  role: "hospital_admin";
}

export default function HospitalLoginPage() {
  const [username, setUsername] = useState(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call with demo credentials check
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      // Create demo hospital user
      const hospitalUser: HospitalUser = {
        id: "hospital-admin-001",
        name: "Hospital Admin",
        hospital_name: "City General Hospital",
        role: "hospital_admin"
      };
      
      localStorage.setItem("pharmalync_token", "demo-hospital-token");
      localStorage.setItem("pharmalync_user", JSON.stringify(hospitalUser));
      
      toast({ title: "Login successful!", description: "Welcome to Hospital Dashboard" });
      navigate("/hospital-dashboard");
    } else {
      toast({ 
        title: "Login failed", 
        description: "Invalid username or password. Use demo credentials.", 
        variant: "destructive" 
      });
    }
    
    setLoading(false);
  };

  const handleQuickLogin = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-display font-bold gradient-text">MedLync</span>
        </div>
        
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Hospital Sign In</CardTitle>
            <CardDescription>Access hospital administration and manage doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Enter username"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  required 
                />
              </div>
              
              {/* Demo credentials hint */}
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Username: </span>
                    <span className="font-mono font-medium">{DEMO_CREDENTIALS.username}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Password: </span>
                    <span className="font-mono font-medium">{DEMO_CREDENTIALS.password}</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground" 
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Not a hospital?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Go back
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
