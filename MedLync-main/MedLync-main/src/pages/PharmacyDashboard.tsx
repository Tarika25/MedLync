import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { verifyPrescription, dispensePrescription, getTransactions, sendOTP, verifyOTP, getInventory, upsertInventory, deleteInventoryItem, createAuditLog, getDrawings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, CheckCircle2, XCircle, ClipboardList, Shield, User as UserIcon, AlertTriangle, Clock, Package, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Barcode from "react-barcode";
import AuditTrail from "@/components/AuditTrail";

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [prescription, setPrescription] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpId, setOtpId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");

  // Inventory
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [newMedName, setNewMedName] = useState("");
  const [newMedQty, setNewMedQty] = useState("0");
  const [addingItem, setAddingItem] = useState(false);

  // Drawings for verified prescription
  const [prescriptionDrawings, setPrescriptionDrawings] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      getTransactions().then((res) => setTransactions(res.transactions || [])).catch(() => {}),
      getInventory().then((res) => setInventory(res.inventory || [])).catch(() => {}),
    ]).finally(() => { setLoadingTx(false); setLoadingInventory(false); });
  }, []);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setPrescription(null);
    setVerifyError("");
    setOtpVerified(false);
    setOtpId("");
    setSimulatedOtp("");
    setPrescriptionDrawings([]);
    try {
      const res = await verifyPrescription(code.trim());
      setPrescription(res.prescription);
      // Log VERIFY action
      if (res.prescription?.id) {
        createAuditLog({ prescription_id: res.prescription.id, action_type: "VERIFY", details: { description: "Prescription verified at pharmacy" } }).catch(() => {});
        // Fetch drawings
        try {
          const drawRes = await getDrawings(res.prescription.id);
          setPrescriptionDrawings(drawRes.drawings || []);
        } catch { }
      }
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSendOTP = async () => {
    if (!prescription?.patient?.phone) {
      toast({ title: "No phone number", description: "Patient phone number not available", variant: "destructive" });
      return;
    }
    setOtpSending(true);
    try {
      const res = await sendOTP(prescription.id, prescription.patient.phone);
      setOtpId(res.otp_id);
      setSimulatedOtp(res.simulated_otp || "");
      setOtpDialogOpen(true);
      toast({ title: "OTP sent!", description: `Sent to ${prescription.patient.phone}` });
    } catch (err: any) {
      toast({ title: "Error sending OTP", description: err.message, variant: "destructive" });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpVerifying(true);
    try {
      await verifyOTP(otpId, otpCode);
      setOtpVerified(true);
      setOtpDialogOpen(false);
      toast({ title: "OTP verified!" });
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.message, variant: "destructive" });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleDispense = async (collectedBy: "self" | "family") => {
    if (collectedBy === "family" && !otpVerified) {
      toast({ title: "OTP verification required for family pickup", variant: "destructive" });
      return;
    }
    setDispensing(true);
    try {
      await dispensePrescription(code.trim(), collectedBy, collectedBy === "family" ? otpId : undefined);
      // Log DISPENSE
      if (prescription?.id) {
        createAuditLog({ prescription_id: prescription.id, action_type: "DISPENSE", details: { description: `Dispensed (${collectedBy} pickup)` } }).catch(() => {});
      }
      toast({ title: "Prescription dispensed successfully!" });
      setPrescription(null);
      setCode("");
      setOtpVerified(false);
      const res = await getTransactions();
      setTransactions(res.transactions || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDispensing(false);
    }
  };

  const handleAddInventory = async () => {
    if (!newMedName.trim()) { toast({ title: "Enter medicine name", variant: "destructive" }); return; }
    setAddingItem(true);
    try {
      await upsertInventory({ medicine_name: newMedName.trim(), quantity: parseInt(newMedQty) || 0 });
      toast({ title: "Inventory updated!" });
      setNewMedName("");
      setNewMedQty("0");
      const res = await getInventory();
      setInventory(res.inventory || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventory(inventory.filter(i => i.id !== id));
      toast({ title: "Item removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const isExpired = prescription?.is_expired || prescription?.status === "Expired";
  const isDispensed = prescription?.status === "Used";

  const getStatusBadge = (status: string) => {
    if (status === "out_of_stock") return <Badge className="bg-destructive/10 text-destructive">Out of Stock</Badge>;
    if (status === "low_stock") return <Badge className="bg-warning/10 text-warning">Low Stock</Badge>;
    return <Badge className="bg-success/10 text-success">In Stock</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {user?.pharmacy_name || "Pharmacy Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">Verify, dispense, and manage inventory</p>
        </div>

        <Tabs defaultValue="dispense">
          <TabsList>
            <TabsTrigger value="dispense">Verify & Dispense</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-1" /> Inventory ({inventory.length})</TabsTrigger>
            <TabsTrigger value="transactions"><ClipboardList className="h-4 w-4 mr-1" /> Transactions</TabsTrigger>
          </TabsList>

          {/* Dispense Tab */}
          <TabsContent value="dispense" className="mt-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="code" className="sr-only">Prescription Barcode</Label>
                    <Input id="code" value={code} onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter or scan barcode (e.g. RX123456789012)"
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
                  </div>
                  <Button onClick={handleVerify} disabled={verifying} className="gradient-primary text-primary-foreground">
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                    Verify
                  </Button>
                </div>

                {verifyError && (
                  <div className="mt-4 flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" /><span className="text-sm">{verifyError}</span>
                  </div>
                )}

                {prescription && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-4 animate-fade-in">
                    {/* Patient info */}
                    {prescription.patient && (
                      <div className="flex items-center gap-3 p-3 rounded-md bg-background border border-border">
                        {prescription.patient.profile_photo_url ? (
                          <img src={prescription.patient.profile_photo_url} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><UserIcon className="h-5 w-5 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{prescription.patient.name}</p>
                          <p className="text-xs text-muted-foreground">Phone: {prescription.patient.phone}</p>
                        </div>
                        <AuditTrail prescriptionId={prescription.id} prescriptionCode={prescription.prescription_code} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold">{prescription.prescription_code}</span>
                      <div className="flex items-center gap-2">
                        {isExpired ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>
                        ) : isDispensed ? (
                          <Badge className="bg-success/10 text-success border-success/20">Dispensed</Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        )}
                      </div>
                    </div>

                    {prescription.expires_at && (
                      <div className={`flex items-center gap-2 text-sm ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                        <Clock className="h-4 w-4" />
                        <span>
                          {isExpired
                            ? `Expired on ${new Date(prescription.expires_at).toLocaleDateString()}`
                            : `Valid until ${new Date(prescription.expires_at).toLocaleDateString()} (${prescription.validity_days} days)`
                          }
                        </span>
                      </div>
                    )}

                    {prescription.doctor_name && (
                      <p className="text-sm text-muted-foreground">Prescribed by: <span className="font-medium text-foreground">Dr. {prescription.doctor_name}</span></p>
                    )}

                    {/* Clinical details */}
                    {(prescription.chief_complaint || prescription.diagnosis) && (
                      <div className="space-y-1 text-sm border-t border-border pt-2">
                        {prescription.chief_complaint && <p><span className="text-muted-foreground">Complaint:</span> {prescription.chief_complaint}</p>}
                        {prescription.diagnosis && <p><span className="text-muted-foreground">Diagnosis:</span> {prescription.diagnosis}</p>}
                      </div>
                    )}

                    <div className="flex justify-center overflow-hidden">
                      <Barcode value={prescription.barcode_id || prescription.prescription_code} width={1.5} height={50} fontSize={10} />
                    </div>

                    <div className="space-y-1">
                      {prescription.medicines?.map((m: any) => (
                        <div key={m.id} className="text-sm">
                          <span className="font-medium">{m.name}</span> — {m.dosage}, {m.frequency}, {m.duration}
                          {m.end_date && <span className="text-muted-foreground"> (until {new Date(m.end_date).toLocaleDateString()})</span>}
                          {m.refill_count > 0 && <span className="text-primary ml-2">Refills: {m.refill_count}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Doctor's handwritten notes */}
                    {prescriptionDrawings.length > 0 && (
                      <div className="border-t border-border pt-2">
                        <p className="text-sm font-semibold text-muted-foreground mb-1.5">Doctor's Handwritten Notes</p>
                        {prescriptionDrawings.map((d: any) => (
                          <div key={d.id} className="border border-border rounded-md p-2 mb-2">
                            <img src={d.image_url} alt="Doctor's note" className="w-full rounded" />
                          </div>
                        ))}
                      </div>
                    )}

                    {isExpired && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="text-sm font-medium text-destructive">This prescription has expired</p>
                          <p className="text-xs text-destructive/80">A new prescription is required for further purchase</p>
                        </div>
                      </div>
                    )}

                    {!isExpired && !isDispensed && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => handleDispense("self")} disabled={dispensing} className="bg-success text-success-foreground hover:bg-success/90">
                            {dispensing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Dispense (Self)
                          </Button>
                          <Button onClick={otpVerified ? () => handleDispense("family") : handleSendOTP} disabled={dispensing || otpSending}
                            variant={otpVerified ? "default" : "outline"}
                            className={otpVerified ? "bg-success text-success-foreground hover:bg-success/90" : ""}>
                            {otpSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                            {otpVerified ? "Dispense (Family)" : "Send OTP for Family"}
                          </Button>
                        </div>
                        {otpVerified && (
                          <p className="text-sm text-success flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> OTP verified — family pickup authorized</p>
                        )}
                      </div>
                    )}

                    {isDispensed && !isExpired && (
                      <div className="flex items-center gap-2 text-warning">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Already dispensed — cannot dispense again</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="mt-4 space-y-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex gap-3 flex-wrap">
                  <Input placeholder="Medicine name" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="flex-1 min-w-[200px]" />
                  <Input type="number" placeholder="Qty" value={newMedQty} onChange={(e) => setNewMedQty(e.target.value)} className="w-24" min="0" />
                  <Button onClick={handleAddInventory} disabled={addingItem} className="gradient-primary text-primary-foreground">
                    {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    Add / Update
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loadingInventory ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : inventory.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  No inventory items yet. Add medicines above.
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.medicine_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            {loadingTx ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">No transactions yet</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map((t, i) => (
                  <Card key={t.id} className="glass-card animate-slide-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-medium">{t.prescriptions?.prescription_code}</span>
                        <p className="text-xs text-muted-foreground">{new Date(t.dispensed_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.prescriptions?.collected_by === "family" && <Badge variant="outline" className="text-xs">Family Pickup</Badge>}
                        <Badge className="bg-success/10 text-success border-0">Dispensed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* OTP Dialog */}
        <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Verify OTP</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">An OTP has been sent to the patient's phone number.</p>
              {simulatedOtp && (
                <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-warning">Simulated SMS — OTP: <span className="font-mono font-bold">{simulatedOtp}</span></p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" maxLength={6} className="font-mono text-center text-lg tracking-widest" />
              </div>
              <Button onClick={handleVerifyOTP} className="w-full gradient-primary text-primary-foreground" disabled={otpVerifying || otpCode.length < 6}>
                {otpVerifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Verify OTP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
