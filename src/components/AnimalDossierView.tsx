import React, { useState } from 'react';
import { Search, Printer, FileText, CheckCircle2, Shield, Calendar, AlertCircle } from 'lucide-react';
import { AdminApiService } from '../services/api';

export const AnimalDossierView: React.FC = () => {
  const [searchTag, setSearchTag] = useState('ET-893421');
  const [dossier, setDossier] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) return;
    setLoading(true);
    setError('');

    const result = await AdminApiService.fetchAnimalDossier(searchTag.trim());
    setLoading(false);
    if (result && result.animal) {
      setDossier(result);
    } else {
      setError(`No clinical dossier located for '${searchTag}'. Please verify the ear tag ID.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>National Livestock Health Dossier System</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Official longitudinal medical record for cattle, buffalo, and small ruminants. Synthesizes clinical cases, AI assessments, certified veterinary diagnoses, and lab tests.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, maxWidth: 540 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            id="admin-dossier-search"
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Enter Unique Ear Tag ID (e.g. ET-893421)..."
            style={{ width: '100%', paddingLeft: 38 }}
          />
        </div>
        <button type="submit" className="btn-gov-primary" disabled={loading}>
          {loading ? 'Retrieving...' : 'Generate Dossier'}
        </button>
      </form>

      {/* Quick Lookup Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Quick Sample Tags:</span>
        {['ET-893421', 'ET-771204', 'ET-550192', 'MH-PUN-001'].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchTag(tag);
              AdminApiService.fetchAnimalDossier(tag).then(res => {
                if (res && res.animal) setDossier(res);
              });
            }}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              fontSize: 12,
              fontWeight: 700,
              color: '#0369a1',
              cursor: 'pointer'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Dossier Document Display */}
      {dossier && (
        <div className="admin-card" style={{ padding: 32 }}>
          {/* Official Document Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '3px solid #0f766e',
            paddingBottom: 20,
            marginBottom: 24
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Department of Animal Husbandry & Dairying
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                Comprehensive Livestock Health & Medical Dossier
              </h1>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Dossier Identifier: {dossier.reportId} • Issued: {new Date(dossier.generatedAt).toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="btn-gov-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={16} /> Print / Export PDF
            </button>
          </div>

          {/* Demographics Block */}
          <div style={{ backgroundColor: '#f8fafc', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', marginBottom: 12 }}>
              Animal Identification & Registration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, fontSize: 13 }}>
              <div>
                <span style={{ color: '#64748b' }}>Ear Tag ID:</span><br />
                <strong style={{ fontSize: 16, color: '#0f172a' }}>{dossier.animal.earTagId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>System Animal ID:</span><br />
                <strong style={{ color: '#0369a1' }}>{dossier.animal.animalId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Species & Breed:</span><br />
                <strong>{dossier.animal.type} ({dossier.animal.breed})</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Age & Gender:</span><br />
                <strong>{dossier.animal.age}, {dossier.animal.gender}</strong>
              </div>
            </div>
          </div>

          {/* Clinical Cases & AI Assessments */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
              Reported Health Incidents & AI Triage Assessments
            </h3>
            {dossier.cases.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No clinical incidents on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.cases.map((c: any) => (
                  <div key={c.caseId} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Case #{c.caseId}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#334155' }}>
                      <strong>Symptoms:</strong> {c.symptoms.join(', ') || 'General examination'}
                    </div>
                    {c.aiPreliminaryAssessment && (
                      <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#166534' }}>
                        <strong>Preliminary AI Risk:</strong> {c.aiPreliminaryAssessment.riskLevel} •{' '}
                        <strong>Possible Conditions:</strong> {c.aiPreliminaryAssessment.possibleConditions?.join(', ')} •{' '}
                        <span style={{ fontStyle: 'italic' }}>Model: {c.aiPreliminaryAssessment.modelVersion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Confirmed Veterinary Diagnoses & Prescriptions */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
              Certified Veterinary Diagnoses & Prescriptions
            </h3>
            {dossier.diagnoses.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No official veterinary diagnoses logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.diagnoses.map((d: any) => (
                  <div key={d.diagnosisId} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ color: '#0f766e', fontSize: 15 }}>{d.finalDiagnosis}</strong>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Attending: {d.vetName}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      <strong>Clinical Observations:</strong> {d.clinicalFindings || 'Examination complete.'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnostic Lab Tests */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
              Laboratory Pathology Investigations
            </h3>
            {dossier.laboratoryTests.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No laboratory diagnostic investigations logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.laboratoryTests.map((t: any) => (
                  <div key={t.bookingId} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: t.report?.isAbnormal ? '#fef2f2' : '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: 14, color: '#0f172a' }}>{t.testType}</strong>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.labName} • Slot: {t.scheduledDate || 'Standard'} ({t.slotTime || 'Morning'})</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={t.report?.isAbnormal ? 'badge-quarantined' : 'badge-verified'}>
                          {t.report?.isAbnormal ? 'Abnormal Findings' : t.status}
                        </span>
                      </div>
                    </div>

                    {t.report && (
                      <div style={{ marginTop: 10, padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: t.report.isAbnormal ? '#b91c1c' : '#0f172a', fontSize: 12.5 }}>
                          Diagnostic Finding: {t.report.resultSummary || t.report.testResult}
                        </div>
                        {t.report.parameters && Object.keys(t.report.parameters).length > 0 && (
                          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {Object.entries(t.report.parameters).map(([k, v]) => (
                              <span key={k} style={{ fontSize: 11, background: '#ffffff', padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}>
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                        {t.report.observations && (
                          <div style={{ marginTop: 6, fontSize: 11.5, color: '#475569', fontStyle: 'italic' }}>
                            Pathologist Remarks: {t.report.observations}
                          </div>
                        )}
                        <div style={{ marginTop: 6, fontSize: 10.5, color: '#94a3b8' }}>
                          Verified by {t.report.staffName || 'Laboratory Technologist'} • Certified at {new Date(t.report.finalizedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal Sign-off Footer */}
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 16, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            This document is generated from the National Veterinary Health & Outbreak Intelligence Network (Pashu Seva).<br />
            Certified for state veterinary movement permits, vaccination compliance, and insurance claims.
          </div>
        </div>
      )}
    </div>
  );
};
