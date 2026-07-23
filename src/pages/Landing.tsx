import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pill, Shield, Stethoscope, User, Building2, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold gradient-text">PharmaLync</span>
          </div>
          <div className="flex gap-2">
            <Link to="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/signup"><Button className="gradient-primary text-primary-foreground">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Secure Digital Prescriptions
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-foreground leading-tight mb-6">
            Prescription Management,{" "}
            <span className="gradient-text">Reimagined</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            PharmaLync connects doctors, patients, and pharmacies with secure digital prescriptions.
            Prevent duplicate usage and medication misuse with barcode-verified dispensing.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/signup"><Button size="lg" className="gradient-primary text-primary-foreground text-base px-8">Start Free</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="text-base px-8">Sign In</Button></Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Stethoscope, title: "For Doctors", description: "Create digital prescriptions with unique barcodes. Select patients, add medicines with dosage details.", color: "bg-primary/10 text-primary" },
            { icon: User, title: "For Patients", description: "View prescriptions, manage family members, and show barcodes at any pharmacy for verified dispensing.", color: "bg-accent/10 text-accent" },
            { icon: Building2, title: "For Pharmacies", description: "Scan or enter barcodes to verify. OTP verification for family pickups. Prevent duplicate dispensing.", color: "bg-success/10 text-success" },
          ].map((f, i) => (
            <div key={f.title} className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100 + 200}ms` }}>
              <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}><f.icon className="h-6 w-6" /></div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Doctor Prescribes", desc: "Creates a digital prescription with a unique barcode" },
              { step: "2", title: "Patient Receives", desc: "Views prescription and shares barcode at pharmacy" },
              { step: "3", title: "OTP Verification", desc: "Family members verify via OTP for secure pickup" },
              { step: "4", title: "Pharmacy Dispenses", desc: "Scans barcode, verifies, and marks as dispensed" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg mb-4">{s.step}</div>
                <h3 className="font-display font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">PharmaLync</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 PharmaLync. Secure prescriptions.</p>
        </div>
      </footer>
    </div>
  );
}
