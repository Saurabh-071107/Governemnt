import React, { useState } from 'react';
import { 
  Users, 
  Tag, 
  Stethoscope, 
  UserCheck, 
  AlertTriangle, 
  Activity, 
  FlaskConical, 
  FileCheck2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AdminKPIs } from '../types';

interface OverviewViewProps {
  stats: AdminKPIs;
  onGoToVetVerification: () => void;
  onGoToOutbreakMap: () => void;
  onRefresh?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  onGoToVetVerification,
  onGoToOutbreakMap,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSync = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const kpiCards = [
    { title: 'Registered Farmers', value: stats.farmersCount, icon: Users, color: '#0284c7', bg: '#e0f2fe' },
    { title: 'Registered Livestock', value: stats.animalsCount, icon: Tag, color: '#059669', bg: '#d1fae5' },
    { title: 'Verified Veterinarians', value: stats.verifiedVetsCount, icon: UserCheck, color: '#16a34a', bg: '#dcfce7' },
    { title: 'Pending Vet Verifications', value: stats.pendingVetsCount, icon: Stethoscope, color: '#d97706', bg: '#fef3c7', action: onGoToVetVerification },
    { title: 'Active Clinical Cases', value: stats.activeCasesCount, icon: Activity, color: '#dc2626', bg: '#fee2e2' },
    { title: 'Teleconsultations Completed', value: stats.totalConsultations, icon: CheckCircle2, color: '#0f766e', bg: '#ccfbf1' },
    { title: 'Diagnostic Lab Tests', value: stats.totalLabTests, icon: FlaskConical, color: '#7c3aed', bg: '#ede9fe' },
    { title: 'Active Outbreak Clusters', value: stats.activeOutbreaksCount, icon: AlertTriangle, color: '#b91c1c', bg: '#fecaca', action: onGoToOutbreakMap },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f766e 100%)',
        color: '#ffffff',
        borderRadius: 16,
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background: 'rgba(45, 212, 191, 0.2)',
              color: '#2dd4bf',
              padding: '4px 10px',
              borderRadius: 9999
            }}>
              Integrated Disease Surveillance Framework
            </span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '3px 8px',
              borderRadius: 9999
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.05em' }}>LIVE REALTIME SYNC</span>
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>
            Livestock Health Intelligence & Biosecurity Network
          </h1>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4, maxWidth: 650 }}>
            Unified real-time surveillance across farmer clinical incident reports, OpenWeather environmental transmission risk, certified veterinary consultations, and accredited biological labs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {onRefresh && (
            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: 8,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
              {isRefreshing ? 'Syncing...' : 'Sync Live'}
            </button>
          )}
          {stats.pendingVetsCount > 0 && (
            <button
              onClick={onGoToVetVerification}
              style={{
                background: '#d97706',
                color: '#ffffff',
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 8,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Verify Vets ({stats.pendingVetsCount})
            </button>
          )}
          <button
            onClick={onGoToOutbreakMap}
            style={{
              background: '#0f766e',
              color: '#ffffff',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <MapPin size={16} /> Surveillance Map
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className="admin-card" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                cursor: kpi.action ? 'pointer' : 'default',
                position: 'relative'
              }}
              onClick={kpi.action}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: kpi.bg,
                color: kpi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {kpi.title}
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Visual Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Disease Distribution Chart/Bars */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Disease Incidence Breakdown</h3>
              <p style={{ fontSize: 12, color: '#64748b' }}>Active syndromic and laboratory-confirmed veterinary diagnoses.</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f766e' }}>Last 30 Days</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(stats.diseaseDistribution).map(([disease, count]) => {
              const maxCount = 10;
              const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
              return (
                <div key={disease}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{disease}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{count} cases</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: disease.includes('Foot') || disease.includes('Lumpy') ? '#dc2626' : '#0f766e',
                      borderRadius: 9999
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Automated Surveillance Engines</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Background real-time telemetry processing status.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>OpenWeather Vector Risk Ingestion</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Caches 3-hr forecasts for farmer PIN clusters</div>
                </div>
                <span className="badge-verified">Active</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Autonomous Vet Workload Dispatcher</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Dispatches to lowest workload verified vets</div>
                </div>
                <span className="badge-verified">Active</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Agora 5-Min Pre-Call Enforcer</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Strict server-side validation on consultation rooms</div>
                </div>
                <span className="badge-verified">Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
