import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Pill, 
  Stethoscope, 
  FileText, 
  MapPin, 
  Phone, 
  X,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Tag
} from 'lucide-react';
import { AdminApiService } from '../services/api';
import { ClinicalCaseItem } from '../types';

export const TelemedicineCasesView: React.FC = () => {
  const [cases, setCases] = useState<ClinicalCaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState<ClinicalCaseItem | null>(null);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await AdminApiService.fetchCases();
      setCases(data || []);
    } catch (err) {
      console.error('Error fetching clinical cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
    const interval = setInterval(loadCases, 12000);
    return () => clearInterval(interval);
  }, []);

  // Compute KPIs
  const totalCases = cases.length;
  const activeCasesCount = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'resolved' && c.status !== 'COMPLETED').length;
  const resolvedCount = cases.filter(c => c.status === 'CLOSED' || c.status === 'resolved' || c.status === 'COMPLETED' || c.status === 'treated' || c.status === 'TREATED').length;
  const highRiskCount = cases.filter(c => (c.aiRiskScore && c.aiRiskScore >= 70) || c.suspectedOutbreak || c.aiSeverity === 'Critical').length;
  const totalPrescriptions = cases.reduce((acc, c) => acc + (c.prescriptions?.length || 0), 0);

  // Extract unique districts
  const districts = Array.from(new Set(cases.map(c => c.district).filter(Boolean))) as string[];

  // Filtered cases
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      (c.caseId || c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.animalId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.aiPredictedDisease || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vetName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.symptoms || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDistrict = districtFilter === 'ALL' || (c.district || '').toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'closed' || s === 'completed' || s === 'resolved') {
      return { label: 'Resolved & Closed', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    }
    if (s === 'treated') {
      return { label: 'Treated & Prescribed', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
    }
    if (s === 'under_examination') {
      return { label: 'Under Examination', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    }
    if (s === 'pending_acceptance' || s === 'queued') {
      return { label: 'Doctor Queued', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
    return { label: status, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const getSeverityBadge = (severity?: string, score?: number) => {
    if (severity === 'Critical' || (score && score >= 75)) {
      return { label: 'CRITICAL', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    }
    if (severity === 'Moderate' || (score && score >= 45)) {
      return { label: 'MODERATE', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
    return { label: 'STABLE', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Header Hero Banner */}
      <div 
        className="gov-banner-card"
        style={{
          background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdf9 40%, rgba(240, 253, 249, 0.25) 75%, #eff6ff 100%)',
          borderColor: '#bfdbfe'
        }}
      >
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-audit-logs.png')` }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, width: '100%', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, maxWidth: 680 }}>
            <div className="gov-banner-icon-box" style={{ background: '#2563eb' }}>
              <Activity size={26} color="#ffffff" strokeWidth={2.3} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 className="gov-banner-title">
                  State Telemedicine & Clinical Operations
                </h1>
                <span style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #bfdbfe'
                }}>
                  REMOTE CLINICAL CARE
                </span>
              </div>
              <p className="gov-banner-subtitle">
                Centralized registry of farmer teleconsultations, AI disease triage predictions, duty veterinarian video consults, and electronic prescriptions.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={loadCases} 
              className="btn-gov-secondary"
              disabled={loading}
              style={{ gap: 6, padding: '10px 18px', backgroundColor: '#ffffff' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> 
              {loading ? 'Refreshing...' : 'Refresh Cases'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clinical Telemedicine KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Telemedicine Cases
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1e40af', marginTop: 4 }}>
                {activeCasesCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={20} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Queued or under examination</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Treated & Resolved
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                {resolvedCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Clinical protocols complete</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                High-Severity Flags
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#b91c1c', marginTop: 4 }}>
                {highRiskCount}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="#dc2626" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Suspected contagion or outbreak</span>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                e-Prescriptions Issued
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#6d28d9', marginTop: 4 }}>
                {totalPrescriptions}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={20} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>With official withdrawal limits</span>
          </div>
        </div>
      </div>

      {/* 3. Clinical Cases Registry Table */}
      <div className="admin-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Live Clinical Telemedicine Registry
            </h2>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0 0' }}>
              Direct oversight of farmer inquiries, AI differential diagnoses, and assigned doctor case notes.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
              <input
                id="admin-cases-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID, tag, symptom..."
                style={{ width: '100%', paddingLeft: 34, paddingRight: 10, height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="under_examination">Under Examination</option>
              <option value="treated">Treated</option>
              <option value="queued">Queued</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              style={{ height: 36, fontSize: 12.5, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px', background: '#ffffff', color: '#0f172a', fontWeight: 600 }}
            >
              <option value="ALL">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredCases.length > 0 ? (
          <div className="gov-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case ID & Date</th>
                  <th>Animal Ear Tag & Farmer</th>
                  <th>Reported Symptoms</th>
                  <th>AI Predicted Condition</th>
                  <th>Severity & Urgency</th>
                  <th>Assigned Veterinarian</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(c => {
                  const statusBadge = getStatusBadge(c.status);
                  const severityBadge = getSeverityBadge(c.aiSeverity, c.aiRiskScore);
                  return (
                    <tr key={c.id || c.caseId}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0f172a' }}>
                          {c.caseId || c.id}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Calendar size={11} /> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#059669', fontSize: 13, background: '#ecfdf5', padding: '2px 6px', borderRadius: 4 }}>
                          {c.animalId}
                        </span>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {c.district || 'Pune'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 220 }}>
                          {(c.symptoms || []).slice(0, 2).map((s, idx) => (
                            <span 
                              key={idx} 
                              style={{
                                fontSize: 11,
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '1px 5px',
                                borderRadius: 4,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {s}
                            </span>
                          ))}
                          {(c.symptoms?.length || 0) > 2 && (
                            <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>
                              +{(c.symptoms?.length || 0) - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e' }}>
                          {c.aiPredictedDisease || 'Clinical Assessment'}
                        </div>
                        {c.aiConfidence && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            AI Conf: {Math.round(c.aiConfidence * 100)}%
                          </div>
                        )}
                      </td>
                      <td>
                        <span 
                          style={{
                            backgroundColor: severityBadge.bg,
                            color: severityBadge.color,
                            border: `1px solid ${severityBadge.border}`,
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            display: 'inline-block'
                          }}
                        >
                          {severityBadge.label} {c.aiRiskScore ? `(${c.aiRiskScore}%)` : ''}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                          {c.vetName || 'Dr. Anand Sharma'}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Duty Medical Officer
                        </div>
                      </td>
                      <td>
                        <span 
                          style={{
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="btn-gov-secondary"
                          style={{ fontSize: 11.5, padding: '5px 10px' }}
                        >
                          Inspect Case
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
            <Activity size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#334155' }}>
              No clinical telemedicine cases match the filter criteria.
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Try adjusting your search query, status, or district filters.
            </div>
          </div>
        )}
      </div>

      {/* 4. Clinical Case Inspector Modal */}
      {selectedCase && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setSelectedCase(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              maxWidth: 640,
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Stethoscope size={20} color="#2563eb" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                    Clinical Telemedicine Dossier
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>
                    Case ID: {selectedCase.caseId || selectedCase.id}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ANIMAL EAR TAG</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#059669', marginTop: 2 }}>{selectedCase.animalId}</div>
                  <div style={{ fontSize: 11.5, color: '#475569' }}>District: {selectedCase.district || 'Pune'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>AI PREDICTED CONDITION</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedCase.aiPredictedDisease || 'Under Evaluation'}</div>
                  <div style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 700 }}>Risk Score: {selectedCase.aiRiskScore || 50}%</div>
                </div>
              </div>

              {/* Reported Symptoms */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Farmer Reported Symptoms
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(selectedCase.symptoms || []).map((s, idx) => (
                    <span 
                      key={idx} 
                      style={{
                        fontSize: 12,
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontWeight: 600
                      }}
                    >
                      • {s}
                    </span>
                  ))}
                </div>
                {selectedCase.description && (
                  <p style={{ fontSize: 12.5, color: '#475569', marginTop: 8, fontStyle: 'italic', background: '#f8fafc', padding: 10, borderRadius: 6 }}>
                    "{selectedCase.description}"
                  </p>
                )}
              </div>

              {/* Doctor Clinical Notes */}
              {selectedCase.vetNotes && (
                <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    Veterinarian Clinical Observations
                  </div>
                  <p style={{ fontSize: 12.5, color: '#14532d', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {selectedCase.vetNotes}
                  </p>
                </div>
              )}

              {/* Prescriptions Issued */}
              {selectedCase.prescriptions && selectedCase.prescriptions.length > 0 && (
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Pill size={15} color="#7c3aed" /> Electronic Prescriptions Issued
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedCase.prescriptions.map((rx, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                            {rx.medicineName}
                          </span>
                          {rx.withdrawalPeriodDays !== undefined && rx.withdrawalPeriodDays > 0 && (
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: 4 }}>
                              Withdrawal: {rx.withdrawalPeriodDays} Days
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 2 }}>
                          Dosage: {rx.dosage}
                        </div>
                        {rx.instructions && (
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            {rx.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
              <button 
                onClick={() => setSelectedCase(null)}
                className="btn-gov-primary"
                style={{ padding: '8px 18px', fontSize: 12.5 }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
