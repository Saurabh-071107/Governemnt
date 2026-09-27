import React, { useState } from 'react';
import { UserCheck, XCircle, ShieldCheck, Search, Award, Building, Phone, Stethoscope, AlertCircle, FileText, ExternalLink, Copy, Check } from 'lucide-react';
import { VeterinarianRecord } from '../types';

interface VetVerificationViewProps {
  vets: VeterinarianRecord[];
  onVerifyVet: (vetId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<any>;
}

export const VetVerificationView: React.FC<VetVerificationViewProps> = ({ vets, onVerifyVet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVet, setSelectedVet] = useState<VeterinarianRecord | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string; doctorName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredVets = vets.filter(v => 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Veterinary Credentialing & Verification Center</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Mandatory state regulatory credential verification. Only verified practitioners are admitted into the automated emergency triage and teleconsultation pool.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: 420 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        <input
          id="admin-vet-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Doctor Name, State Reg No, or District..."
          style={{ width: '100%', paddingLeft: 38 }}
        />
      </div>

      {/* Vets Table */}
      <div className="gov-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>State Council Reg ID</th>
              <th>Qualifications</th>
              <th>Dispensary / Clinic</th>
              <th>District & State</th>
              <th>Certificate</th>
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
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{vet.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{vet.phone}</div>
                    {vet.email && <div style={{ fontSize: 11, color: '#0284c7' }}>{vet.email}</div>}
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#0369a1'
                    }}>
                      {vet.doctorId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{vet.qualification}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{vet.specialization}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: '#334155' }}>{vet.hospitalClinic}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{vet.district}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{vet.state}</div>
                  </td>
                  <td>
                    {vet.certificateUrl ? (
                      <a
                        href={vet.certificateUrl.startsWith('http') ? vet.certificateUrl : `http://localhost:5000${vet.certificateUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: '#e0f2fe',
                          color: '#0284c7',
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <FileText size={13} /> View Doc <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>None Attached</span>
                    )}
                  </td>
                  <td>
                    {isVerified && <span className="badge-verified">VERIFIED</span>}
                    {isPending && <span className="badge-pending">PENDING AUDIT</span>}
                    {isRejected && <span className="badge-rejected">REJECTED</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isPending && (
                        <>
                          <button
                            id={`admin-btn-verify-${vet.id}`}
                            className="btn-gov-primary"
                            style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => {
                              setSelectedVet(vet);
                              setActionType('VERIFY');
                            }}
                          >
                            <UserCheck size={14} /> Verify
                          </button>
                          <button
                            id={`admin-btn-reject-${vet.id}`}
                            className="btn-gov-danger"
                            onClick={() => {
                              setSelectedVet(vet);
                              setActionType('REJECT');
                              setRejectionReason('Incomplete State Veterinary Council documentation');
                            }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {isVerified && (
                        <button
                          className="btn-gov-secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => {
                            setSelectedVet(vet);
                            setActionType('REJECT');
                            setRejectionReason('Regulatory audit or practice outside approved district jurisdiction');
                          }}
                        >
                          Revoke / Audit
                        </button>
                      )}

                      {isRejected && (
                        <button
                          className="btn-gov-primary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => {
                            setSelectedVet(vet);
                            setActionType('VERIFY');
                          }}
                        >
                          Re-Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation / Rejection Modal */}
      {selectedVet && actionType && (
        <div className="modal-overlay" onClick={() => setSelectedVet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {actionType === 'VERIFY' ? (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} />
                </div>
              )}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  {actionType === 'VERIFY' ? 'Approve Veterinary License' : 'Reject / Revoke Credentials'}
                </h3>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Practitioner: {selectedVet.name} ({selectedVet.doctorId})
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
              {actionType === 'VERIFY' 
                ? 'Approving this veterinarian creates/activates their practitioner account and generates an official login password for the Pashu Seva Vet mobile app.'
                : 'Rejecting this practitioner will immediately exclude them from receiving teleconsultation cases.'}
            </p>

            {actionType === 'REJECT' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Regulatory Rejection Reason *
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    'Incomplete State Veterinary Council documentation',
                    'Accreditation expired or invalid registration ID',
                    'Practicing outside approved district jurisdiction'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: rejectionReason === preset ? '#eff6ff' : '#f8fafc',
                        color: rejectionReason === preset ? '#1d4ed8' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  id="admin-vet-reject-reason"
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State Council documentation expired or incomplete..."
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <button className="btn-gov-secondary" onClick={() => setSelectedVet(null)}>
                Cancel
              </button>
              <button
                id="admin-vet-confirm-action"
                className={actionType === 'VERIFY' ? 'btn-gov-primary' : 'btn-gov-danger'}
                onClick={handleConfirmAction}
                disabled={processing}
              >
                {processing ? 'Processing...' : (actionType === 'VERIFY' ? 'Confirm Official Verification & Issue Credentials' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal */}
      {generatedCredentials && (
        <div className="modal-overlay" onClick={() => setGeneratedCredentials(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Practitioner Verified!</h3>
                <p style={{ fontSize: 12, color: '#64748b' }}>Account activated and login credentials issued.</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                Doctor: <strong>{generatedCredentials.doctorName}</strong>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Login Email:</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: 6 }}>
                  {generatedCredentials.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>Assigned Password:</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: 6, letterSpacing: 1 }}>
                  {generatedCredentials.password}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
              The veterinarian can now log into the <strong>Pashu Seva Vet App</strong> using this Email ID and Password.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                className="btn-gov-primary"
                onClick={() => {
                  navigator.clipboard?.writeText?.(`Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  setGeneratedCredentials(null);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} Copy & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
