import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { listPrescriptions, getFamilyMembers, addFamilyMember, uploadProfilePhoto } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Users, Plus, Upload, User as UserIcon, ChevronDown, ChevronUp, AlertTriangle, Clock, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Barcode from "react-barcode";

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberDob, setMemberDob] = useState("");
  const [memberRelationship, setMemberRelationship] = useState("");
  const [memberGender, setMemberGender] = useState("");
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      listPrescriptions().then((res) => setPrescriptions(res.prescriptions || [])),
      getFamilyMembers().then((res) => setFamilyMembers(res.members || [])).catch(() => {}),
    ]).catch((err) => toast({ title: "Error", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleAddMember = async () => {
    if (!memberName || !memberEmail || !memberPassword || !memberDob || !memberRelationship) {
      toast({ title: "Fill all required fields", variant: "destructive" }); return;
    }
    setAddingMember(true);
    try {
      let profile_photo_url: string | undefined;
      if (memberPhoto) { profile_photo_url = await uploadProfilePhoto(memberPhoto); }
      await addFamilyMember({
        name: memberName, email: memberEmail, password: memberPassword,
        date_of_birth: memberDob, relationship_type: memberRelationship,
        profile_photo_url, gender: memberGender || undefined,
      });
      toast({ title: "Family member added!" });
      setFamilyOpen(false);
      setMemberName(""); setMemberEmail(""); setMemberPassword(""); setMemberDob("");
      setMemberRelationship(""); setMemberGender(""); setMemberPhoto(null); setMemberPhotoPreview("");
      const res = await getFamilyMembers();
      setFamilyMembers(res.members || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingMember(false);
    }
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const activePrescriptions = prescriptions.filter((p) => p.status === "Active");
  const expiredPrescriptions = prescriptions.filter((p) => p.status === "Expired");
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === "Used");
  const nearExpiryPrescriptions = prescriptions.filter((p) => p.is_near_expiry);

  // Medicine refill reminders: medicines ending within 7 days
  const refillReminders: { prescription: any; medicine: any }[] = [];
  const now = new Date();
  prescriptions.forEach((p) => {
    p.medicines?.forEach((m: any) => {
      if (m.end_date) {
        const endDate = new Date(m.end_date);
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 7) {
          refillReminders.push({ prescription: p, medicine: { ...m, daysLeft } });
        }
      }
    });
  });

  const getStatusBadge = (p: any) => {
    if (p.status === "Expired") return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>;
    if (p.is_near_expiry) return <Badge className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">Expiring Soon</Badge>;
    if (p.status === "Used") return <Badge className="bg-success/10 text-success border-success/20">Dispensed</Badge>;
    return <Badge className="bg-warning/10 text-warning border-warning/20">Active</Badge>;
  };

  const renderPrescriptionList = (items: any[]) => (
    items.length === 0 ? (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No prescriptions in this category</p>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-3">
        {items.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <Card key={p.id} className={`glass-card overflow-hidden animate-fade-in ${p.is_near_expiry ? "border-destructive/30" : ""}`}>
              <button type="button" className="w-full text-left" onClick={() => toggleExpand(p.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{p.doctor?.hospital_name || "Hospital"}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.doctor_name && <span>Dr. {p.doctor_name} • </span>}
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(p)}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </CardContent>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fade-in">
                  <div className="flex justify-center overflow-hidden">
                    <Barcode value={p.barcode_id || p.prescription_code} width={1.5} height={55} fontSize={11} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{p.doctor_name || p.doctor?.name || "—"}</p></div>
                    <div><p className="text-muted-foreground">Status</p>{getStatusBadge(p)}</div>
                    <div><p className="text-muted-foreground">Valid for</p><p className="font-medium">{p.validity_days} days</p></div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className={`font-medium ${p.is_expired || p.is_near_expiry ? "text-destructive" : ""}`}>
                        {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1.5">Medicines</p>
                    <div className="space-y-1.5">
                      {p.medicines?.map((m: any) => (
                        <div key={m.id} className="text-sm p-2.5 rounded-md bg-muted/50">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{m.name}</p>
                            {m.end_date && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Until {new Date(m.end_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">{m.dosage} • {m.frequency} • {m.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    )
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {user?.profile_photo_url && (
            <img src={user.profile_photo_url} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-primary" />
          )}
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Prescriptions</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {user?.patient_unique_id && <span className="font-mono">{user.patient_unique_id} • </span>}
              {user?.age && <span>Age: {user.age}</span>}
            </p>
          </div>
        </div>

        {/* Refill reminders */}
        {refillReminders.length > 0 && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning flex-shrink-0" />
                <p className="text-sm font-semibold text-warning">Refill Reminders</p>
              </div>
              {refillReminders.map((r, i) => (
                <div key={i} className="text-sm pl-7">
                  <span className="font-medium">{r.medicine.name}</span>
                  <span className="text-muted-foreground"> — ends in {r.medicine.daysLeft} day(s) ({new Date(r.medicine.end_date).toLocaleDateString()})</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Near expiry alert */}
        {nearExpiryPrescriptions.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm font-medium text-destructive">
                {nearExpiryPrescriptions.length} prescription(s) expiring within 7 days — visit your doctor for a renewal
              </p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="flex-wrap">
              <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredPrescriptions.length})</TabsTrigger>
              <TabsTrigger value="dispensed">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
              <TabsTrigger value="family">
                <Users className="h-4 w-4 mr-1" /> Family ({familyMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">{renderPrescriptionList(activePrescriptions)}</TabsContent>
            <TabsContent value="expired" className="mt-4">{renderPrescriptionList(expiredPrescriptions)}</TabsContent>
            <TabsContent value="dispensed" className="mt-4">{renderPrescriptionList(dispensedPrescriptions)}</TabsContent>

            {/* Family Tab */}
            <TabsContent value="family" className="mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold">Family Members</h2>
                {!user?.is_minor && (
                  <Dialog open={familyOpen} onOpenChange={setFamilyOpen}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> Add Family Member</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle className="font-display">Add Family Member</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Full Name <span className="text-destructive">*</span></Label>
                          <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Name" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Email <span className="text-destructive">*</span></Label>
                          <Input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="email@example.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Password <span className="text-destructive">*</span></Label>
                          <Input type="password" value={memberPassword} onChange={(e) => setMemberPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Date of Birth <span className="text-destructive">*</span></Label>
                            <Input type="date" value={memberDob} onChange={(e) => setMemberDob(e.target.value)} max={new Date().toISOString().split("T")[0]} required />
                            {memberDob && <p className="text-sm text-muted-foreground">Age: {calculateAge(memberDob)} years</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select value={memberGender} onValueChange={setMemberGender}>
                              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship <span className="text-destructive">*</span></Label>
                          <Select value={memberRelationship} onValueChange={setMemberRelationship}>
                            <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Spouse">Spouse</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Profile Photo</Label>
                          <div className="flex items-center gap-3">
                            {memberPhotoPreview ? (
                              <img src={memberPhotoPreview} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><UserIcon className="h-5 w-5 text-muted-foreground" /></div>
                            )}
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-muted text-sm"><Upload className="h-4 w-4" /> Upload</div>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) { setMemberPhoto(f); setMemberPhotoPreview(URL.createObjectURL(f)); }
                              }} />
                            </label>
                          </div>
                        </div>
                        <Button onClick={handleAddMember} className="w-full gradient-primary text-primary-foreground" disabled={addingMember}>
                          {addingMember && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add Family Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {familyMembers.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No family members added yet</p>
                    {!user?.is_minor && (
                      <Button onClick={() => setFamilyOpen(true)} className="gradient-primary text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" /> Add Your First Family Member
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {familyMembers.map((m) => (
                    <Card key={m.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {m.profile_photo_url ? (
                            <img src={m.profile_photo_url} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-primary" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-border"><UserIcon className="h-6 w-6 text-muted-foreground" /></div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{m.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {m.relationship_type} • Age: {m.age}
                              {m.gender && ` • ${m.gender}`}
                            </p>
                          </div>
                        </div>
                        {m.is_minor && <Badge variant="secondary" className="text-xs mb-2">Minor</Badge>}
                        {m.patient_unique_id && (
                          <p className="text-xs font-mono text-muted-foreground">{m.patient_unique_id}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
