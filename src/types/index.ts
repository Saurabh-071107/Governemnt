export interface AdminKPIs {
  farmersCount: number;
  animalsCount: number;
  totalVets: number;
  verifiedVetsCount: number;
  pendingVetsCount: number;
  rejectedVetsCount: number;
  activeCasesCount: number;
  completedCasesCount: number;
  totalConsultations: number;
  totalLabTests: number;
  activeOutbreaksCount: number;
  diseaseDistribution: Record<string, number>;
}

export interface VeterinarianRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  doctorId: string;
  qualification: string;
  specialization: string;
  hospitalClinic: string;
  experienceYears?: number;
  district: string;
  state: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'pending' | 'verified';
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface SurveillanceLayerItem {
  id: string;
  title: string;
  coordinates: [number, number]; // [lng, lat]
  district: string;
  severity?: string;
  caseCount?: number;
  environmentalScore?: number;
  combinedScore?: number;
  statusWording?: string;
  recommendation?: string;
  temperature?: number;
  humidity?: number;
  condition?: string;
}

export interface SurveillanceLayersData {
  timestamp: string;
  layers: {
    OBSERVED_CASES: SurveillanceLayerItem[];
    ENVIRONMENTAL_RISK: SurveillanceLayerItem[];
    COMBINED_RISK: SurveillanceLayerItem[];
  };
}

export interface AuditLogItem {
  id?: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  createdAt: string;
}

export type AdminTab = 
  | 'overview' 
  | 'vet-verification' 
  | 'outbreak-map' 
  | 'medical-dossier' 
  | 'cases' 
  | 'lab-surveillance' 
  | 'audit-logs';
