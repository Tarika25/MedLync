const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const API_BASE = `${SUPABASE_URL}/functions/v1`;

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("pharmalync_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function signup(data: {
  name: string; email: string; password: string; role: string; phone: string;
  hospital_name?: string; pharmacy_name?: string; date_of_birth?: string;
  parent_account_id?: string; relationship_type?: string; profile_photo_url?: string;
}) {
  const res = await fetch(`${API_BASE}/auth/signup`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  localStorage.setItem("pharmalync_token", json.token);
  localStorage.setItem("pharmalync_user", JSON.stringify(json.user));
  return json;
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  localStorage.setItem("pharmalync_token", json.token);
  localStorage.setItem("pharmalync_user", JSON.stringify(json.user));
  return json;
}

export function logout() {
  localStorage.removeItem("pharmalync_token");
  localStorage.removeItem("pharmalync_user");
}

export function getUser() {
  const user = localStorage.getItem("pharmalync_user");
  return user ? JSON.parse(user) : null;
}

export function getToken() {
  return localStorage.getItem("pharmalync_token");
}

export async function createPrescription(data: {
  patient_id: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string; refill_count?: number }[];
  doctor_name: string;
  validity_days?: number;
  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  follow_up_date?: string;
  additional_notes?: string;
}) {
  const res = await fetch(`${API_BASE}/prescriptions/create`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function listPrescriptions() {
  const res = await fetch(`${API_BASE}/prescriptions/list`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function verifyPrescription(code: string) {
  const res = await fetch(`${API_BASE}/prescriptions/verify?code=${encodeURIComponent(code)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getPatients(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/prescriptions/patients${params}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function dispensePrescription(prescription_code: string, collected_by = "self", otp_id?: string) {
  const res = await fetch(`${API_BASE}/pharmacy/dispense`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ prescription_code, collected_by, otp_id }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getTransactions() {
  const res = await fetch(`${API_BASE}/pharmacy/transactions`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getFamilyMembers() {
  const res = await fetch(`${API_BASE}/prescriptions/family`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function addFamilyMember(data: {
  name: string; email: string; password: string; date_of_birth: string;
  relationship_type: string; profile_photo_url?: string; gender?: string;
}) {
  const res = await fetch(`${API_BASE}/prescriptions/add-family`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function sendOTP(prescription_id: string, phone_number: string) {
  const res = await fetch(`${API_BASE}/prescriptions/send-otp`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ prescription_id, phone_number }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function verifyOTP(otp_id: string, otp_code: string) {
  const res = await fetch(`${API_BASE}/prescriptions/verify-otp`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ otp_id, otp_code }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const fileName = `${Date.now()}-${file.name}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${fileName}`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload photo");
  return `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`;
}

// Hospital doctor management
export async function getHospitalDoctors() {
  const res = await fetch(`${API_BASE}/prescriptions/doctors`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function addHospitalDoctor(data: { name: string; specialization?: string }) {
  const res = await fetch(`${API_BASE}/prescriptions/add-doctor`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function removeHospitalDoctor(doctor_id: string) {
  const res = await fetch(`${API_BASE}/prescriptions/remove-doctor`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ doctor_id }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

// ==================== NEW PLATFORM APIs ====================

// Drug Database
export async function searchDrugs(q: string) {
  const res = await fetch(`${API_BASE}/platform/drug-search?q=${encodeURIComponent(q)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function checkDrugInteractions(medicine_names: string[]) {
  const res = await fetch(`${API_BASE}/platform/drug-interactions`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ medicine_names }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getGenericAlternative(medicine: string) {
  const res = await fetch(`${API_BASE}/platform/generic-alternative?medicine=${encodeURIComponent(medicine)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

// Audit Logs
export async function createAuditLog(data: { prescription_id: string; action_type: string; details?: Record<string, unknown> }) {
  const res = await fetch(`${API_BASE}/platform/audit-log`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getAuditLogs(prescription_id: string) {
  const res = await fetch(`${API_BASE}/platform/audit-logs?prescription_id=${encodeURIComponent(prescription_id)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

// Pharmacy Inventory
export async function getInventory(pharmacy_id?: string) {
  const params = pharmacy_id ? `?pharmacy_id=${encodeURIComponent(pharmacy_id)}` : "";
  const res = await fetch(`${API_BASE}/platform/inventory${params}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function upsertInventory(data: { medicine_name: string; quantity: number }) {
  const res = await fetch(`${API_BASE}/platform/inventory-upsert`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function deleteInventoryItem(item_id: string) {
  const res = await fetch(`${API_BASE}/platform/inventory-delete`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ item_id }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function checkAvailability(medicine: string) {
  const res = await fetch(`${API_BASE}/platform/check-availability?medicine=${encodeURIComponent(medicine)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

// Prescription Drawings
export async function saveDrawing(prescription_id: string, image_url: string) {
  const res = await fetch(`${API_BASE}/platform/save-drawing`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ prescription_id, image_url }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function getDrawings(prescription_id: string) {
  const res = await fetch(`${API_BASE}/platform/drawings?prescription_id=${encodeURIComponent(prescription_id)}`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

export async function uploadDrawingImage(dataUrl: string): Promise<string> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const blob = await (await fetch(dataUrl)).blob();
  const fileName = `drawing-${Date.now()}.png`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/prescription-drawings/${fileName}`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "image/png" },
    body: blob,
  });
  if (!res.ok) throw new Error("Failed to upload drawing");
  return `${SUPABASE_URL}/storage/v1/object/public/prescription-drawings/${fileName}`;
}
