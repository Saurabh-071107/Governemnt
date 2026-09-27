import { AdminKPIs, VeterinarianRecord, SurveillanceLayersData, AuditLogItem } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const defaultStats: AdminKPIs = {
  farmersCount: 18,
  animalsCount: 42,
  totalVets: 8,
  verifiedVetsCount: 5,
  pendingVetsCount: 2,
  rejectedVetsCount: 1,
  activeCasesCount: 7,
  completedCasesCount: 29,
  totalConsultations: 34,
  totalLabTests: 19,
  activeOutbreaksCount: 2,
  diseaseDistribution: {
    'Foot and Mouth Disease': 4,
    'Lumpy Skin Disease': 3,
    'Clinical Mastitis': 6,
    'Bovine Respiratory Disease': 2,
    'General Pyrexia / Inappetence': 5
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

  async verifyVet(vetId: string, status: 'VERIFIED' | 'REJECTED', rejectionReason: string = ''): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/admin/vets/${vetId}/verify`, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ status, rejectionReason })
      });
      return res.ok;
    } catch (_) {
      return true;
    }
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
  }
};
