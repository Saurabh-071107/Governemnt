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
  certificateUrl?: string;
  assignedTempPassword?: string;
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
  disease?: string;
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

export interface AIPredictedOutbreak {
  id: string;
  district: string;
  village: string;
  panchayat: string;
  disease: string;
  probabilityPercent: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  clinicalInquiryCount: number;
  highRiskCasesCount: number;
  affectedSpecies: string[];
  detectedSymptoms: string[];
  coordinates: { lat: number; lng: number };
  weatherFactors: {
    temperature: number;
    humidity: number;
    rain: number;
    condition: string;
    vectorRiskExplanation: string;
  };
  recommendedAction: string;
  recentFarmerInquiries?: any[];
  lastAnalyzedAt: string;
}

export interface FarmerAIInquiryItem {
  id: string;
  animalTag: string;
  farmerPhone: string;
  village: string;
  species: string;
  symptoms: string[];
  farmerQuestion: string;
  aiDiagnosedCondition: string;
  aiSeverity: string;
  aiConfidence: string;
  timestamp: string;
}

export interface AISurveillanceData {
  success: boolean;
  timestamp: string;
  modelVersion: string;
  totalAnalyzedCases: number;
  highRiskZonesCount: number;
  predictedOutbreaks: AIPredictedOutbreak[];
  recentAIInquiries: FarmerAIInquiryItem[];
}

export interface MarketplaceListingItem {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  title: string;
  category: string;
  expectedPrice: number;
  animalTag?: string;
  description?: string;
  photoUrl?: string;
  village?: string;
  district?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isGovVerified: boolean;
  healthCertificateTag?: string;
  verifiedAt?: string;
  verifiedByName?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt: string;
}

export type AdminTab = 
  | 'overview' 
  | 'vet-verification' 
  | 'ai-surveillance'
  | 'outbreak-map'
  | 'emergency-dispatch'
  | 'marketplace-verification'
  | 'medical-dossier' 
  | 'cases' 
  | 'lab-surveillance' 
  | 'audit-logs';

