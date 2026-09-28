import React, { useState } from 'react';
import { 
  Award,
  UserCheck, 
  XCircle, 
  ShieldCheck, 
  Search, 
  Phone, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check,
  Clock,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { VeterinarianRecord } from '../types';

interface VetVerificationViewProps {
  vets: VeterinarianRecord[];
  onVerifyVet: (vetId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<any>;
}

const defaultDemoVets: VeterinarianRecord[] = [
  {
    id: 'vet-101',
    name: 'Dr. Anand Sharma',
    phone: '+91 98220 11223',
    doctorId: 'VET-MH-2024-0941',
    qualification: 'B.V.Sc. & A.H., M.V.Sc. (Surgery)',
    specialization: 'Bovine Medicine & Surgery',
    hospitalClinic: 'Rural Veterinary Dispensary, Pune Division',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'vet-102',
    name: 'Dr. Priya Kadam',
    phone: '+91 98230 44555',
    doctorId: 'VET-MH-2024-3312',
    qualification: 'B.V.Sc. & A.H.',
    specialization: 'Preventive Veterinary & Public Health',
    hospitalClinic: 'Taluka Veterinary Polyclinic, Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'vet-103',
    name: 'Dr. Vikram Patil',
    phone: '+91 90144 88990',
    doctorId: 'VET-MH-2023-7721',
    qualification: 'B.V.Sc. & A.H.',
    specialization: 'General Veterinary Practice',
    hospitalClinic: 'Veterinary Aid Centre, Jalur',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'PENDING'
  },
  {
    id: 'vet-104',
    name: 'Dr. Sunita Jagtap',
    phone: '+91 98112 33445',
    doctorId: 'VET-MH-2024-9011',
    qualification: 'B.V.Sc. & A.H.',
    specialization: 'Ruminant Reproduction & Gynaecology',
    hospitalClinic: 'Khed Veterinary Dispensary',
    district: 'Pune',
    state: 'Maharashtra',
    verificationStatus: 'PENDING'
  }
];

export const VetVerificationView: React.FC<VetVerificationViewProps> = ({ vets, onVerifyVet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVet, setSelectedVet] = useState<VeterinarianRecord | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string; doctorName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Combine real backend vets with sample state council demo vets if list is empty
  const activeVetList = vets && vets.length > 0 ? vets : defaultDemoVets;

  const filteredVets = activeVetList.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.doctorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmAction = async () => {
    if (!selectedVet || !actionType) return;
    setProcessing(true);
    const res: any = await onVerifyVet(
      selectedVet.id,
      actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
      rejectionReason
    );
    setProcessing(false);
    if (actionType === 'VERIFY') {
      const creds = res?.credentials || {
        email: selectedVet.email || `${selectedVet.doctorId.toLowerCase().replace(/[^a-z0-9]/g, '')}@vetcare.in`,
        password: `Vet@${selectedVet.doctorId.replace(/[^a-zA-Z0-9]/g, '') || '2026'}`
      };
      setGeneratedCredentials({
        doctorName: selectedVet.name,
        email: creds.email,
        password: creds.password
      });
    }
    setSelectedVet(null);
    setActionType(null);
    setRejectionReason('');
  };

  const handleCopyCredentials = () => {
    if (!generatedCredentials) return;
    const text = `Dr. ${generatedCredentials.doctorName} Credentials:\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Banner */}
      <div 
        className="gov-banner-card amber-theme"
        style={{
          background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 38%, rgba(254, 243, 199, 0.25) 70%, #fffbeb 100%)',
          borderColor: '#fde68a'
        }}
      >
        {/* Vector Background Graphic */}
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-vet-credentialing.png')` }} 
        />

        {/* Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 2, maxWidth: 680 }}>
          <div 
            className="gov-banner-icon-box"
            style={{
              background: '#ea580c',
              borderColor: '#c2410c',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(234, 88, 12, 0.25)'
            }}
          >
            <Award size={26} color="#ffffff" strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="gov-banner-title">
              Veterinary Credentialing & Verification Center
            </h1>
            <p className="gov-banner-subtitle">
              Mandatory state regulatory credential verification. Only verified practitioners are admitted into the automated emergency triage and teleconsultation pool.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Search Input */}
      <div style={{ position: 'relative', maxWidth: 440 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
        <input
          id="admin-vet-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Doctor Name, State Reg No, or District..."
          style={{ 
            width: '100%', 
            paddingLeft: 40,
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {/* 3. Vets Credentials Table */}
      <div className="gov-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>State Council Reg ID</th>
              <th>Qualifications</th>
              <th>Dispensary / Clinic</th>
              <th>District & State</th>
              <th>Verification Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVets.map(vet => {
              const isVerified = (vet.verificationStatus || '').toUpperCase() === 'VERIFIED';
              const isRejected = (vet.verificationStatus || '').toUpperCase() === 'REJECTED';
              const isPending = !isVerified && !isRejected;

              return (
                <tr key={vet.id}>
                  {/* Doctor Name & Contact */}
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>
                      {vet.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Phone size={11} color="#059669" /> {vet.phone}
                    </div>
                  </td>

                  {/* State Council Reg ID */}
                  <td>
                    <span style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      color: '#0284c7'
                    }}>
                      {vet.doctorId}
                    </span>
                  </td>

                  {/* Qualifications */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
                      {vet.qualification}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                      {vet.specialization}
                    </div>
                  </td>

                  {/* Dispensary / Clinic */}
                  <td>
                    <div style={{ fontSize: 12.5, color: '#334155', fontWeight: 500, maxWidth: 220 }}>
                      {vet.hospitalClinic}
                    </div>
                  </td>

                  {/* District & State */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                      {vet.district}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      {vet.state || 'Maharashtra'}
                    </div>
                  </td>

                  {/* Verification Status Badge */}
                  <td>
                    {isVerified && (
                      <span className="badge-verified">
                        <CheckCircle2 size={12} strokeWidth={2.5} /> VERIFIED
                      </span>
                    )}
                    {isPending && (
                      <span className="badge-pending">
                        <Clock size={12} strokeWidth={2.5} /> PENDING AUDIT
                      </span>
                    )}
                    {isRejected && (
                      <span className="badge-danger">
                        <XCircle size={12} strokeWidth={2.5} /> REJECTED
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    {isVerified && (
                      <button
                        onClick={() => {
                          setSelectedVet(vet);
                          setActionType('REJECT');
                          setRejectionReason('Initiated state veterinary regulatory re-audit');
                        }}
                        style={{
                          fontSize: 12,
                          color: '#0284c7',
                          fontWeight: 600,
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '5px 12px',
                          borderRadius: 6
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
                      >
                        Revoke / Audit
                      </button>
                    )}

                    {isPending && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          id={`admin-btn-verify-${vet.id}`}
                          onClick={() => {
                            setSelectedVet(vet);
                            setActionType('VERIFY');
                          }}
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: '0 1px 4px rgba(4, 120, 87, 0.2)'
                          }}
                        >
                          <UserCheck size={13} /> Verify
                        </button>

                        <button
                          id={`admin-btn-reject-${vet.id}`}
                          onClick={() => {
                            setSelectedVet(vet);
                            setActionType('REJECT');
                            setRejectionReason('Incomplete State Veterinary Council documentation');
                          }}
                          style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            padding: '6px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation & Rejection Modal */}
      {selectedVet && actionType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            padding: 28,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              {actionType === 'VERIFY' ? 'Approve Veterinary License' : 'Reject Practitioner Credentials'}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              {actionType === 'VERIFY'
                ? `You are confirming accreditation for ${selectedVet.name} (Reg: ${selectedVet.doctorId}). This issues automated state dispensary credentials and adds them to the emergency telemedicine triage mesh.`
                : `Specify regulatory rationale for rejecting ${selectedVet.name}'s state accreditation.`
              }
            </p>

            {actionType === 'REJECT' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Rejection Reason / Regulatory Deficiency:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. State registration expired or invalid surgical license..."
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn-gov-secondary"
                disabled={processing}
                onClick={() => {
                  setSelectedVet(null);
                  setActionType(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmAction}
                style={{
                  background: actionType === 'VERIFY' ? '#047857' : '#dc2626',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm Accreditation' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Popup */}
      {generatedCredentials && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            padding: 28,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CheckCircle2 size={24} color="#059669" />
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Accreditation Approved & Credentials Issued
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px', lineHeight: 1.5 }}>
              Temporary portal login credentials generated for <strong>Dr. {generatedCredentials.doctorName}</strong>. Transmit via secure SMS/email.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Portal Username:</span>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>{generatedCredentials.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Assigned Password:</span>
                <strong style={{ fontSize: 13, color: '#059669' }}>{generatedCredentials.password}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn-gov-secondary"
                onClick={handleCopyCredentials}
              >
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Credentials'}
              </button>
              <button
                type="button"
                className="btn-gov-primary"
                onClick={() => setGeneratedCredentials(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
