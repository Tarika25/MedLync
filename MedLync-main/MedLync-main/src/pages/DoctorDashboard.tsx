import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { createPrescription, listPrescriptions, getPatients, getHospitalDoctors, addHospitalDoctor, removeHospitalDoctor, checkDrugInteractions, createAuditLog, uploadDrawingImage, saveDrawing, getDrawings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Users, FileText, Stethoscope, Search, AlertTriangle, Clock, UserPlus, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Barcode from "react-barcode";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import DrugSearchInput from "@/components/DrugSearchInput";
import SenseBoard from "@/components/SenseBoard";
import AuditTrail from "@/components/AuditTrail";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  refill_count: number;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [validityDays, setValidityDays] = useState("7");
  const [patientSearch, setPatientSearch] = useState("");
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", dosage: "", frequency: "", duration: "", refill_count: 0 }]);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [voiceTarget, setVoiceTarget] = useState<string | null>(null);
  const { isListening, startListening, stopListening, isSupported: voiceSupported } = useVoiceDictation();
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpec, setNewDoctorSpec] = useState("");
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<any[]>([]);
  const [savingDrawing, setSavingDrawing] = useState(false);
  const [detailDrawings, setDetailDrawings] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [pRes, patRes, docRes] = await Promise.all([
        listPrescriptions(), getPatients(), getHospitalDoctors()
      ]);
      setPrescriptions(pRes.prescriptions || []);
      setPatients(patRes.patients || []);
      setHospitalDoctors(docRes.doctors || []);
    } catch (err: any) {
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Check drug interactions when medicines change
  useEffect(() => {
    const names = medicines.map(m => m.name).filter(n => n.length > 1);
    if (names.length < 2) { setInteractionWarnings([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await checkDrugInteractions(names);
        setInteractionWarnings(res.warnings || []);
      } catch { }
    }, 500);
    return () => clearTimeout(timer);
  }, [medicines]);

  const handleSearchPatients = async (query: string) => {
    setPatientSearch(query);
    if (query.length < 2) {
      const res = await getPatients();
      setPatients(res.patients || []);
      return;
    }
    setSearchingPatients(true);
    try {
      const res = await getPatients(query);
      setPatients(res.patients || []);
    } catch { }
    finally { setSearchingPatients(false); }
  };

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", refill_count: 0 }]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: keyof Medicine, value: string | number) => {
    const updated = [...medicines];
    if (field === "refill_count") {
      updated[i][field] = Number(value);
    } else {
      (updated[i] as any)[field] = value;
    }
    setMedicines(updated);
  };

  const handleCreate = async () => {
    if (!selectedPatient) { toast({ title: "Select a patient", variant: "destructive" }); return; }
    if (!selectedDoctor) { toast({ title: "Select a doctor", variant: "destructive" }); return; }
    if (medicines.some((m) => !m.name || !m.dosage || !m.frequency || !m.duration)) { toast({ title: "Fill all medicine fields", variant: "destructive" }); return; }
    setCreating(true);
    try {
      const result = await createPrescription({
        patient_id: selectedPatient,
        medicines,
        doctor_name: selectedDoctor,
        validity_days: parseInt(validityDays) || 7,
        chief_complaint: chiefComplaint || undefined,
        symptoms: symptoms || undefined,
        diagnosis: diagnosis || undefined,
        follow_up_date: followUpDate || undefined,
        additional_notes: additionalNotes || undefined,
      });

      // Create audit log
      if (result.prescription?.id) {
        await createAuditLog({
          prescription_id: result.prescription.id,
          action_type: "CREATE",
          details: { description: `Prescription created by Dr. ${selectedDoctor}` },
        }).catch(() => {});
      }

      toast({ title: "Prescription created!" });
      setCreateOpen(false);
      setSelectedPatient("");
      setSelectedDoctor("");
      setPatientSearch("");
      setValidityDays("7");
      setChiefComplaint("");
      setSymptoms("");
      setDiagnosis("");
      setFollowUpDate("");
      setAdditionalNotes("");
      setMedicines([{ name: "", dosage: "", frequency: "", duration: "", refill_count: 0 }]);
      setInteractionWarnings([]);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctorName.trim()) { toast({ title: "Enter doctor name", variant: "destructive" }); return; }
    setAddingDoctor(true);
    try {
      await addHospitalDoctor({ name: newDoctorName.trim(), specialization: newDoctorSpec.trim() || undefined });
      toast({ title: "Doctor added!" });
      setNewDoctorName("");
      setNewDoctorSpec("");
      const res = await getHospitalDoctors();
      setHospitalDoctors(res.doctors || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (id: string) => {
    try {
      await removeHospitalDoctor(id);
      setHospitalDoctors(hospitalDoctors.filter((d) => d.id !== id));
      toast({ title: "Doctor removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveDrawing = async (dataUrl: string) => {
    if (!selectedPrescription?.id) return;
    setSavingDrawing(true);
    try {
      const imageUrl = await uploadDrawingImage(dataUrl);
      await saveDrawing(selectedPrescription.id, imageUrl);
      await createAuditLog({
        prescription_id: selectedPrescription.id,
        action_type: "MODIFY",
        details: { description: "Handwritten note added via SenseBoard" },
      }).catch(() => {});
      toast({ title: "Drawing saved!" });
      // Refresh drawings
      const res = await getDrawings(selectedPrescription.id);
      setDetailDrawings(res.drawings || []);
    } catch (err: any) {
      toast({ title: "Error saving drawing", description: err.message, variant: "destructive" });
    } finally {
      setSavingDrawing(false);
    }
  };

  const activePrescriptions = prescriptions.filter((p) => p.status === "Active");
  const expiredPrescriptions = prescriptions.filter((p) => p.status === "Expired");
  const dispensedPrescriptions = prescriptions.filter((p) => p.status === "Used");
  const nearExpiryPrescriptions = prescriptions.filter((p) => p.is_near_expiry);
  const totalPatients = new Set(prescriptions.map((p) => p.patient_id)).size;

  const openDetail = async (p: any) => {
    setSelectedPrescription(p);
    setDetailOpen(true);
    // Log VIEW action
    createAuditLog({ prescription_id: p.id, action_type: "VIEW", details: { description: "Prescription viewed by doctor" } }).catch(() => {});
    // Fetch drawings
    try {
      const res = await getDrawings(p.id);
      setDetailDrawings(res.drawings || []);
    } catch { setDetailDrawings([]); }
  };

  const getStatusBadge = (p: any) => {
    if (p.status === "Expired") return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>;
    if (p.is_near_expiry) return <Badge className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">Expiring Soon</Badge>;
    if (p.status === "Used") return <Badge className="bg-success/10 text-success border-success/20">Dispensed</Badge>;
    return <Badge className="bg-warning/10 text-warning border-warning/20">Active</Badge>;
  };

  const renderPrescriptionTable = (items: any[]) => (
    <Card className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow
                key={p.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${p.is_near_expiry ? "bg-destructive/5" : ""}`}
                onClick={() => openDetail(p)}
              >
                <TableCell className="font-medium">{p.patient?.name || "—"}</TableCell>
                <TableCell className="font-mono text-xs">{p.patient?.patient_unique_id || "—"}</TableCell>
                <TableCell className="text-sm">{p.doctor_name || "—"}</TableCell>
                <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">
                  {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>{getStatusBadge(p)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {user?.hospital_name || "Hospital Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              <Stethoscope className="inline h-4 w-4 mr-1" />
              {user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" /> Manage Doctors</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Manage Doctors</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="Dr. John Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialization (optional)</Label>
                    <Input value={newDoctorSpec} onChange={(e) => setNewDoctorSpec(e.target.value)} placeholder="Cardiologist" />
                  </div>
                  <Button onClick={handleAddDoctor} className="w-full gradient-primary text-primary-foreground" disabled={addingDoctor}>
                    {addingDoctor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add Doctor
                  </Button>
                  {hospitalDoctors.length > 0 && (
                    <div className="border border-border rounded-md divide-y divide-border">
                      {hospitalDoctors.map((d) => (
                        <div key={d.id} className="px-3 py-2 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{d.name}</p>
                            {d.specialization && <p className="text-xs text-muted-foreground">{d.specialization}</p>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveDoctor(d.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New Prescription</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">Create Prescription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Doctor selection */}
                  <div className="space-y-2">
                    <Label>Prescribing Doctor <span className="text-destructive">*</span></Label>
                    {hospitalDoctors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No doctors added yet. <button type="button" className="text-primary underline" onClick={() => { setCreateOpen(false); setDoctorDialogOpen(true); }}>Add doctors first</button></p>
                    ) : (
                      <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                        <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                        <SelectContent>
                          {hospitalDoctors.map((d) => (
                            <SelectItem key={d.id} value={d.name}>
                              {d.name}{d.specialization ? ` (${d.specialization})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Patient search */}
                  <div className="space-y-2">
                    <Label>Search Patient (by ID or Phone)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={patientSearch} onChange={(e) => handleSearchPatients(e.target.value)} placeholder="PAT-2026-0001 or +1234567890" className="pl-10" />
                    </div>
                    {searchingPatients && <p className="text-xs text-muted-foreground">Searching...</p>}
                    {patients.length > 0 && (
                      <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                        {patients.map((p) => (
                          <button key={p.id} type="button" onClick={() => { setSelectedPatient(p.id); setPatientSearch(`${p.patient_unique_id || ""} — ${p.name}`); }}
                            className={`w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-3 text-sm border-b border-border last:border-0 transition-colors ${selectedPatient === p.id ? "bg-primary/10" : ""}`}>
                            {p.profile_photo_url ? (
                              <img src={p.profile_photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Users className="h-3.5 w-3.5 text-muted-foreground" /></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.patient_unique_id && <span className="font-mono">{p.patient_unique_id}</span>}
                                {p.phone && <span> • {p.phone}</span>}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Clinical Details with Voice Input */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Clinical Details</Label>
                      {voiceSupported && (
                        <Button
                          type="button"
                          variant={isListening ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isListening) {
                              stopListening();
                              setVoiceTarget(null);
                            } else {
                              toast({ title: "Voice input active", description: "Click a mic icon next to a field to target it." });
                            }
                          }}
                        >
                          {isListening ? <MicOff className="h-3.5 w-3.5 mr-1" /> : <Mic className="h-3.5 w-3.5 mr-1" />}
                          {isListening ? "Stop Dictation" : "Voice Input"}
                        </Button>
                      )}
                    </div>

                    {[
                      { label: "Chief Complaint / Purpose of Visit", value: chiefComplaint, setter: setChiefComplaint, key: "complaint" },
                      { label: "Symptoms", value: symptoms, setter: setSymptoms, key: "symptoms" },
                      { label: "Diagnosis", value: diagnosis, setter: setDiagnosis, key: "diagnosis" },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label>{field.label}</Label>
                          {voiceSupported && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 ${voiceTarget === field.key && isListening ? "text-destructive" : "text-muted-foreground"}`}
                              onClick={() => {
                                if (voiceTarget === field.key && isListening) {
                                  stopListening();
                                  setVoiceTarget(null);
                                } else {
                                  setVoiceTarget(field.key);
                                  startListening((text) => {
                                    field.setter((prev: string) => prev ? `${prev} ${text}` : text);
                                  });
                                }
                              }}
                            >
                              <Mic className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="min-h-[60px]"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Follow-up Date</Label>
                        <Input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Prescription Validity (days)</Label>
                        <Input type="number" min="1" max="365" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} placeholder="7" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label>Additional Notes</Label>
                        {voiceSupported && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${voiceTarget === "notes" && isListening ? "text-destructive" : "text-muted-foreground"}`}
                            onClick={() => {
                              if (voiceTarget === "notes" && isListening) {
                                stopListening();
                                setVoiceTarget(null);
                              } else {
                                setVoiceTarget("notes");
                                startListening((text) => {
                                  setAdditionalNotes((prev) => prev ? `${prev} ${text}` : text);
                                });
                              }
                            }}
                          >
                            <Mic className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Any additional instructions..."
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Medicines with Drug Search */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Medicines</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMedicine}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                    </div>

                    {/* Drug interaction warnings */}
                    {interactionWarnings.length > 0 && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 space-y-1">
                        {interactionWarnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive font-medium">{w.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {medicines.map((m, i) => (
                      <Card key={i} className="bg-muted/50">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Medicine {i + 1}</span>
                            {medicines.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeMedicine(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <DrugSearchInput
                              value={m.name}
                              onChange={(val) => updateMedicine(i, "name", val)}
                              onDrugSelect={(drug) => {
                                if (drug.standard_dosage && !m.dosage) {
                                  updateMedicine(i, "dosage", drug.standard_dosage.split(" ")[0] || "");
                                }
                              }}
                              onGenericSwitch={(name) => updateMedicine(i, "name", name)}
                              allMedicineNames={medicines.filter((_, idx) => idx !== i).map(med => med.name)}
                              placeholder="Medicine name"
                            />
                            <Input placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} />
                            <Input placeholder="Frequency (e.g. 2x/day)" value={m.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} />
                            <Input placeholder="Duration (e.g. 3 months)" value={m.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">Refill Count</Label>
                            <Input type="number" min="0" max="12" value={m.refill_count} onChange={(e) => updateMedicine(i, "refill_count", e.target.value)} className="w-20 h-8 text-sm" placeholder="0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={handleCreate} className="w-full gradient-primary text-primary-foreground" disabled={creating}>
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create Prescription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPatients}</p>
                <p className="text-sm text-muted-foreground">Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activePrescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{expiredPrescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{dispensedPrescriptions.length}</p>
                <p className="text-sm text-muted-foreground">Dispensed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Near expiry alert */}
        {nearExpiryPrescriptions.length > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm font-medium text-destructive">
                {nearExpiryPrescriptions.length} prescription(s) expiring within 7 days
              </p>
            </CardContent>
          </Card>
        )}

        {/* Prescriptions Tabs */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : prescriptions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No prescriptions yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({prescriptions.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredPrescriptions.length})</TabsTrigger>
              <TabsTrigger value="dispensed">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">{renderPrescriptionTable(prescriptions)}</TabsContent>
            <TabsContent value="active" className="mt-4">{renderPrescriptionTable(activePrescriptions)}</TabsContent>
            <TabsContent value="expired" className="mt-4">{renderPrescriptionTable(expiredPrescriptions)}</TabsContent>
            <TabsContent value="dispensed" className="mt-4">{renderPrescriptionTable(dispensedPrescriptions)}</TabsContent>
          </Tabs>
        )}

        {/* Prescription Detail Modal */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="font-display">Prescription Details</DialogTitle>
                {selectedPrescription && (
                  <AuditTrail prescriptionId={selectedPrescription.id} prescriptionCode={selectedPrescription.prescription_code} />
                )}
              </div>
            </DialogHeader>
            {selectedPrescription && (
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Doctor</p>
                    <p className="font-medium">{selectedPrescription.doctor_name || user?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hospital</p>
                    <p className="font-medium">{user?.hospital_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedPrescription.patient?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Patient ID</p>
                    <p className="font-mono font-medium">{selectedPrescription.patient?.patient_unique_id || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className={`font-medium ${selectedPrescription.is_expired ? "text-destructive" : selectedPrescription.is_near_expiry ? "text-destructive" : ""}`}>
                      {selectedPrescription.expires_at ? new Date(selectedPrescription.expires_at).toLocaleDateString() : "—"}
                      {selectedPrescription.is_expired && " (Expired)"}
                      {selectedPrescription.is_near_expiry && " ⚠️"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validity</p>
                    <p className="font-medium">{selectedPrescription.validity_days} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPrescription)}
                  </div>
                </div>

                {/* Clinical details */}
                {(selectedPrescription.chief_complaint || selectedPrescription.symptoms || selectedPrescription.diagnosis) && (
                  <div className="space-y-2 border-t border-border pt-3">
                    {selectedPrescription.chief_complaint && (
                      <div className="text-sm"><p className="text-muted-foreground">Chief Complaint</p><p className="font-medium">{selectedPrescription.chief_complaint}</p></div>
                    )}
                    {selectedPrescription.symptoms && (
                      <div className="text-sm"><p className="text-muted-foreground">Symptoms</p><p className="font-medium">{selectedPrescription.symptoms}</p></div>
                    )}
                    {selectedPrescription.diagnosis && (
                      <div className="text-sm"><p className="text-muted-foreground">Diagnosis</p><p className="font-medium">{selectedPrescription.diagnosis}</p></div>
                    )}
                    {selectedPrescription.follow_up_date && (
                      <div className="text-sm"><p className="text-muted-foreground">Follow-up Date</p><p className="font-medium">{new Date(selectedPrescription.follow_up_date).toLocaleDateString()}</p></div>
                    )}
                    {selectedPrescription.additional_notes && (
                      <div className="text-sm"><p className="text-muted-foreground">Notes</p><p className="font-medium">{selectedPrescription.additional_notes}</p></div>
                    )}
                  </div>
                )}

                <div className="flex justify-center py-2 overflow-hidden">
                  <Barcode value={selectedPrescription.barcode_id || selectedPrescription.prescription_code} width={1.5} height={55} fontSize={11} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Medicines</p>
                  <div className="space-y-2">
                    {selectedPrescription.medicines?.map((m: any) => (
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
                        {m.refill_count > 0 && <p className="text-xs text-primary mt-1">Refills: {m.refill_count}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SenseBoard - Handwritten Notes */}
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Handwritten Notes (SenseBoard)</p>
                  <SenseBoard onSave={handleSaveDrawing} saving={savingDrawing} />
                  {detailDrawings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Saved drawings:</p>
                      {detailDrawings.map((d: any) => (
                        <div key={d.id} className="border border-border rounded-md p-2">
                          <img src={d.image_url} alt="Handwritten note" className="w-full rounded" />
                          <p className="text-xs text-muted-foreground mt-1">{new Date(d.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
