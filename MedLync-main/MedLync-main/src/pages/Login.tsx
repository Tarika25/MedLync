import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Loader2, Building2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      navigate(`/dashboard/${user.role}`);
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Pill className="h-8 w-8 text-primary" />
          <span className="text-2xl font-display font-bold gradient-text">MedLync</span>
        </div>
        
        {/* Login Options Card */}
        <Card className="glass-card mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Choose Your Option</CardTitle>
            <CardDescription>Select how you want to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hospital Sign In Option */}
            <Link to="/hospital-login">
              <Button 
                variant="outline" 
                className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              >
                <Building2 className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <span className="font-semibold text-foreground">Hospital Sign In</span>
                  <p className="text-xs text-muted-foreground mt-1">For hospital administrators and doctors</p>
                </div>
              </Button>
            </Link>
            
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            {/* Patient/Pharmacy Sign Up Option */}
            <Link to="/signup">
              <Button 
                variant="outline" 
                className="w-full h-auto py-4 flex flex-col items-center gap-2 border-2 border-success/20 hover:border-success hover:bg-success/5"
              >
                <UserPlus className="h-8 w-8 text-success" />
                <div className="text-center">
                  <span className="font-semibold text-foreground">Patient / Pharmacy Sign Up</span>
                  <p className="text-xs text-muted-foreground mt-1">Register as a new patient or pharmacy</p>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Existing Email/Password Login */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-display">Existing Account</CardTitle>
            <CardDescription>Sign in with email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
