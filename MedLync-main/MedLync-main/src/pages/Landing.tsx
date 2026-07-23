import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pill, Shield, Stethoscope, User, Building2, Database, Calendar, FlaskConical, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary" />
            <span className="text-xl font-display font-bold gradient-text">MedLync</span>
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
            MedLync connects doctors, patients, and pharmacies with secure digital prescriptions.
            Drug safety alerts, inventory tracking, and blockchain audit trails built in.
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
            { icon: Stethoscope, title: "For Doctors", description: "Create digital prescriptions with drug safety alerts, voice input, SenseBoard whiteboard, and generic substitution suggestions.", color: "bg-primary/10 text-primary" },
            { icon: User, title: "For Patients", description: "View prescriptions, family medication calendar, refill reminders, and share barcodes at any pharmacy.", color: "bg-accent/10 text-accent" },
            { icon: Building2, title: "For Pharmacies", description: "Inventory management, barcode verification, OTP-secured family pickups, and revenue tracking.", color: "bg-success/10 text-success" },
          ].map((f, i) => (
            <div key={f.title} className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100 + 200}ms` }}>
              <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}><f.icon className="h-6 w-6" /></div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform features */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-12">Platform Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Database, title: "Drug Database", desc: "30+ medicines with safety alerts, interactions, and dosage info" },
              { icon: FlaskConical, title: "Generic Substitution", desc: "Automatic generic alternatives with savings calculations" },
              { icon: Calendar, title: "Family Calendar", desc: "Color-coded medication calendar for the whole family" },
              { icon: ShieldCheck, title: "Blockchain Audit", desc: "Tamper-proof audit trail with SHA-256 hash chains" },
            ].map((s) => (
              <div key={s.title} className="glass-card rounded-xl p-5">
                <s.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Doctor Prescribes", desc: "Creates a digital prescription with drug safety checks" },
              { step: "2", title: "Patient Receives", desc: "Views prescription and family medication calendar" },
              { step: "3", title: "OTP Verification", desc: "Family members verify via OTP for secure pickup" },
              { step: "4", title: "Pharmacy Dispenses", desc: "Scans barcode, checks inventory, and dispenses" },
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
            <span className="font-display font-semibold text-foreground">MedLync</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 MedLync. Secure prescriptions.</p>
        </div>
      </footer>
    </div>
  );
}