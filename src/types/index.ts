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
  actorName?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface LabTestBooking {
  id: string;
  bookingId: string;
  testBookingId?: string;
  farmerId?: string;
  farmerName?: string;
  farmerPhone?: string;
  animalId?: string;
  animalTag: string;
  animalType?: string;
  caseId?: string | null;
  laboratoryId: string;
  labName: string;
  district: string;
  testType: string;
  date: string;
  slotDate?: string;
  slotId?: string;
  slotTime?: string;
  collectionOtp?: string;
  collectorName?: string;
  collectorPhone?: string;
  notes?: string;
  status: 'TEST_BOOKED' | 'ACCEPTED' | 'SAMPLE_COLLECTED' | 'IN_TESTING' | 'REPORT_AVAILABLE' | 'COMPLETED' | 'CANCELLED' | string;
  createdAt: string;
  reportId?: string;
  report?: LabTestReport;
}

export interface LabTestReport {
  id: string;
  reportId: string;
  bookingId: string;
  animalTag: string;
  testType: string;
  testResult: string;
  resultSummary: string;
  parameters?: Record<string, string>;
  observations?: string;
  isAbnormal: boolean;
  finalizedBy?: string;
  staffName?: string;
  finalizedAt?: string;
}

export interface DiagnosticLaboratory {
  id: string;
  code: string;
  name: string;
  address: string;
  district: string;
  state: string;
  phone: string;
  testsOffered: string[];
}

export interface ClinicalCaseItem {
  id: string;
  caseId?: string;
  animalId: string;
  farmerId: string;
  vetId?: string;
  assignedVetId?: string;
  vetName?: string;
  symptoms: string[];
  description?: string;
  photoUrls?: string[];
  aiRiskScore?: number;
  aiPredictedDisease?: string;
  aiConfidence?: number;
  aiSeverity?: string;
  suspectedOutbreak?: boolean;
  status: 'QUEUED' | 'PENDING_ACCEPTANCE' | 'VET_REQUIRED' | 'UNDER_EXAMINATION' | 'under_examination' | 'TREATED' | 'treated' | 'RESOLVED' | 'resolved' | 'CLOSED' | 'COMPLETED' | string;
  vetNotes?: string;
  recommendedTests?: {
    id: string;
    testName: string;
    labName: string;
    status: string;
    orderedAt: string;
  }[];
  prescriptions?: {
    id: string;
    medicineName: string;
    dosage: string;
    instructions: string;
    withdrawalPeriodDays?: number;
  }[];
  district?: string;
  state?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt?: string;
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

