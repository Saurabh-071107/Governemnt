import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  FileSearch,
  Sparkles,
  Award
} from 'lucide-react';
import { AdminApiService } from '../services/api';

export const AnimalDossierView: React.FC = () => {
  const [searchTag, setSearchTag] = useState('ET-893421');
  const [dossier, setDossier] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent, customTag?: string) => {
    if (e) e.preventDefault();
    const tagToSearch = customTag || searchTag;
    if (!tagToSearch.trim()) return;
    setLoading(true);
    setError('');

    const result = await AdminApiService.fetchAnimalDossier(tagToSearch.trim());
    setLoading(false);
    if (result && result.animal) {
      setDossier(result);
    } else {
      setDossier(null);
      setError(`No clinical dossier located for '${tagToSearch}'. Please verify the ear tag ID.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Hero Banner */}
      <div 
        className="gov-banner-card"
        style={{
          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf9 38%, rgba(240, 253, 249, 0.25) 70%, #ecfdf5 100%)',
          borderColor: '#d1fae5'
        }}
      >
        {/* Vector Background Graphic */}
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-livestock-dossier.png')` }} 
        />

        {/* Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 2, maxWidth: 680 }}>
          <div 
            className="gov-banner-icon-box dark-emerald"
          >
            <FileText size={26} color="#ffffff" strokeWidth={2.3} />
          </div>

          <div>
            <h1 className="gov-banner-title">
              National Livestock Health Dossier System
            </h1>
            <p className="gov-banner-subtitle">
              Official longitudinal medical record for cattle, buffalo, and small ruminants. Synthesizes clinical cases, AI assessments, certified veterinary diagnoses, and lab tests.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Search Toolbar */}
      <form onSubmit={(e) => handleSearch(e)} style={{ display: 'flex', gap: 12, maxWidth: 540 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
          <input
            id="admin-dossier-search"
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            placeholder="Enter Unique Ear Tag ID (e.g. ET-893421)..."
            style={{ width: '100%', paddingLeft: 40, borderRadius: 8 }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: '#047857',
            color: '#ffffff',
            padding: '9px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)'
          }}
        >
          <FileText size={15} />
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
              handleSearch(undefined, tag);
            }}
            style={{
              padding: '4px 10px',
              backgroundColor: '#f1f5f9',
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#0369a1',
              border: '1px solid #e2e8f0'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: 13, border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* 3. Empty State or Loaded Dossier */}
      {!dossier && !loading && (
        <div 
          className="admin-card" 
          style={{ 
            padding: '64px 32px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed #e2e8f0',
            background: '#ffffff'
          }}
        >
          {/* Document & Magnifier Central Graphic Box */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: '#ecfdf5',
            border: '2px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
          }}>
            <FileSearch size={40} color="#059669" strokeWidth={1.8} />
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No Dossier Found
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 420, margin: 0, lineHeight: 1.5 }}>
            Enter a valid Animal ID or Registration Number to generate a comprehensive longitudinal livestock dossier.
          </p>
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
            borderBottom: '3px solid #047857',
            paddingBottom: 20,
            marginBottom: 24
          }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Department of Animal Husbandry & Dairying • Government of Maharashtra
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                Comprehensive Livestock Health & Medical Dossier
              </h1>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Dossier Identifier: <strong>{dossier.reportId}</strong> • Issued: {new Date(dossier.generatedAt).toLocaleDateString()}
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
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 14 }}>
              Animal Identification & Registration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13 }}>
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
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
              Reported Health Incidents & AI Triage Assessments
            </h3>
            {dossier.cases.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No clinical incidents on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.cases.map((c: any) => (
                  <div key={c.caseId} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>Case #{c.caseId}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#334155' }}>
                      <strong>Symptoms:</strong> {c.symptoms.join(', ') || 'General examination'}
                    </div>
                    {c.aiPreliminaryAssessment && (
                      <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#166534', border: '1px solid #bbf7d0' }}>
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
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
              Certified Veterinary Diagnoses & Prescriptions
            </h3>
            {dossier.diagnoses.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No official veterinary diagnoses logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.diagnoses.map((d: any) => (
                  <div key={d.diagnosisId} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ color: '#047857', fontSize: 14.5 }}>{d.finalDiagnosis}</strong>
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
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 14 }}>
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
                      <span className={t.report?.isAbnormal ? 'badge-danger' : 'badge-verified'}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
