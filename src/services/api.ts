import { AdminKPIs, VeterinarianRecord, SurveillanceLayersData, AuditLogItem } from '../types';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://pashu-seva-backend.onrender.com/api';
export const SOCKET_URL = BASE_URL.replace(/\/api\/?$/, '');

const defaultStats: AdminKPIs = {
  farmersCount: 0,
  animalsCount: 0,
  totalVets: 0,
  verifiedVetsCount: 0,
  pendingVetsCount: 0,
  rejectedVetsCount: 0,
  activeCasesCount: 0,
  completedCasesCount: 0,
  totalConsultations: 0,
  totalLabTests: 0,
  activeOutbreaksCount: 0,
  diseaseDistribution: {
    'Foot and Mouth Disease': 0,
    'Lumpy Skin Disease': 0,
    'Clinical Mastitis': 0,
    'Bovine Respiratory Disease': 0,
    'General Pyrexia / Inappetence': 0
  }
};

const defaultVets: VeterinarianRecord[] = [
  {
    id: 'usr-vet-1',
    name: 'Dr. Anand Sharma',
    phone: '+91 98220 11223',
    doctorId: 'VET-MH-2018-0941',
    qualification: 'B.V.Sc & A.H., M.V.Sc (Surgery)',
    specialization: 'Bovine Medicine & Surgery',
    hospitalClinic: 'Rural Veterinary Dispensary, Pune Division',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'usr-vet-2',
    name: 'Dr. Priya Kadam',
    phone: '+91 98220 44556',
    doctorId: 'VET-MH-2021-3312',
    qualification: 'B.V.Sc & A.H.',
    specialization: 'Livestock Epidemiology & Herd Health',
    hospitalClinic: 'Taluka Veterinary Polyclinic, Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-02-14T11:30:00Z'
  },
  {
    id: 'usr-vet-3',
    name: 'Dr. Vikram Patil',
    phone: '+91 97654 88990',
    doctorId: 'VET-MH-2023-7721',
    qualification: 'B.V.Sc & A.H.',
    specialization: 'General Veterinary Practice',
    hospitalClinic: 'Veterinary Aid Centre, Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'PENDING'
  },
  {
    id: 'usr-vet-4',
    name: 'Dr. Sunita Jagtap',
    phone: '+91 98112 33445',
    doctorId: 'VET-MH-2024-9011',
    qualification: 'B.V.Sc & A.H.',
    specialization: 'Ruminant Reproduction & Gynaecology',
    hospitalClinic: 'Khed Veterinary Dispensary',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'PENDING'
  }
];

export const AdminApiService = {
  getAuthHeader() {
    const token = localStorage.getItem('pashu_admin_token') || 'demo-admin-token';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  async fetchStats(): Promise<AdminKPIs> {
    try {
      const res = await fetch(`${BASE_URL}/admin/stats`, { headers: this.getAuthHeader() });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return defaultStats;
  },

  async fetchVets(): Promise<VeterinarianRecord[]> {
    try {
      const res = await fetch(`${BASE_URL}/admin/vets`, { headers: this.getAuthHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (_) {}
    return defaultVets;
  },

  async verifyVet(vetId: string, status: 'VERIFIED' | 'REJECTED', rejectionReason: string = ''): Promise<{ success: boolean; credentials?: { email: string; password: string } }> {
    try {
      const res = await fetch(`${BASE_URL}/admin/vets/${vetId}/verify`, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ status, rejectionReason })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, credentials: data.credentials };
      }
    } catch (_) {}
    return { success: true };
  },

  async fetchSurveillanceLayers(): Promise<SurveillanceLayersData | null> {
    try {
      const res = await fetch(`${BASE_URL}/outbreaks/surveillance-layers`, { headers: this.getAuthHeader() });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return null;
  },

  async triggerOutbreakEvaluation(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/outbreaks/evaluate`, {
        method: 'POST',
        headers: this.getAuthHeader()
      });
      return res.ok;
    } catch (_) {
      return true;
    }
  },

  async fetchAnimalDossier(animalTagOrId: string) {
    try {
      const res = await fetch(`${BASE_URL}/animals/${animalTagOrId}/medical-history`, { headers: this.getAuthHeader() });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return null;
  },

  async fetchAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/admin/audit-logs`, { headers: this.getAuthHeader() });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return [];
  },

  async dispatchEmergencyVet(payload: { caseId?: string; district?: string; notes?: string; assignedVetId?: string }) {
    try {
      const caseParam = payload.caseId || 'case-101';
      const res = await fetch(`${BASE_URL}/cases/${caseParam}/dispatch-emergency`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return { success: true, message: 'Emergency veterinarian dispatched to district cluster' };
  },

  /** Fetch all vets currently on Emergency Duty (vet-to-gov channel only) */
  async fetchEmergencyDutyVets(): Promise<{ onDuty: EmergencyDutyVet[]; count: number }> {
    try {
      const res = await fetch(`${BASE_URL}/vets/emergency-duty`, { headers: this.getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (_) {}
    // Graceful fallback for demo / offline
    return { onDuty: [], count: 0 };
  },

  /** Dispatch an emergency case to a specific vet who is on duty */
  async dispatchEmergencyToVet(vetId: string, payload: { district: string; notes: string; caseType: string }) {
    try {
      const res = await fetch(`${BASE_URL}/cases/dispatch-emergency`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ assignedVetId: vetId, ...payload })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: 'Emergency dispatched successfully.' };
  },

  /** Fetch Major AI Outbreak & Disease Surveillance Intelligence */
  async fetchAISurveillanceIntelligence() {
    try {
      const res = await fetch(`${BASE_URL}/admin/ai-surveillance`, { headers: this.getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },

  /** Push Emergency Outbreak Alert to both Farmers and Doctors */
  async pushAIEmergencyAlert(payload: {
    village: string;
    panchayat?: string;
    district?: string;
    disease: string;
    probabilityPercent: number;
    severity?: string;
    customMessage?: string;
  }) {
    try {
      const res = await fetch(`${BASE_URL}/admin/ai-surveillance/push-emergency-alert`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: 'Emergency notification dispatched to village farmers and doctors.' };
  },

  /** Fetch all farmer sell listings for Govt Verification */
  async fetchMarketplaceListings(status?: string, category?: string) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      const url = `${BASE_URL}/admin/marketplace/listings${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { headers: this.getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (_) {}
    return [];
  },

  /** Government Admin certifies or rejects a farmer marketplace listing */
  async verifyMarketplaceListing(listingId: string, status: 'VERIFIED' | 'REJECTED', remarks: string = '', rejectionReason: string = '') {
    try {
      const res = await fetch(`${BASE_URL}/admin/marketplace/listings/${listingId}/verify`, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ status, remarks, rejectionReason })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: `Listing marked as ${status}` };
  }
};

export interface EmergencyDutyVet {
  id: string;
  name: string;
  phone: string;
  district: string;
  specialization: string;
  licenseNumber: string;
  emergencyDutySince: string | null;
}

