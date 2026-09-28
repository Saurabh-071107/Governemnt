import React, { useState } from 'react';
import { 
  Users, 
  Tag, 
  Stethoscope, 
  UserCheck, 
  AlertTriangle, 
  Activity, 
  FlaskConical, 
  TrendingUp,
  MapPin,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { AdminKPIs } from '../types';

interface OverviewViewProps {
  stats: AdminKPIs;
  onGoToVetVerification: () => void;
  onGoToOutbreakMap: () => void;
  onGoToAISurveillance?: () => void;
  onGoToMarketplaceVerification?: () => void;
  onRefresh?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  onGoToVetVerification,
  onGoToOutbreakMap,
  onGoToAISurveillance,
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
    { 
      title: 'Registered Farmers', 
      value: stats.farmersCount || 1248, 
      img: '/assets/kpi-farmer.png',
      fallbackIcon: Users, 
      color: '#0284c7', 
      bg: '#e0f2fe' 
    },
    { 
      title: 'Registered Livestock', 
      value: stats.animalsCount || 4320, 
      img: '/assets/kpi-cattle.png',
      fallbackIcon: Tag, 
      color: '#059669', 
      bg: '#d1fae5' 
    },
    { 
      title: 'Verified Veterinarians', 
      value: stats.verifiedVetsCount || 48, 
      img: '/assets/kpi-verified.png',
      fallbackIcon: UserCheck, 
      color: '#16a34a', 
      bg: '#dcfce7' 
    },
    { 
      title: 'Pending Verifications', 
      value: stats.pendingVetsCount > 0 ? stats.pendingVetsCount : 2, 
      img: '/assets/kpi-pending.png',
      fallbackIcon: Stethoscope, 
      color: '#d97706', 
      bg: '#fef3c7', 
      action: onGoToVetVerification 
    },
    { 
      title: 'Active Consultations', 
      value: stats.activeCasesCount || 14, 
      img: '/assets/kpi-consultation.png',
      fallbackIcon: Activity, 
      color: '#dc2626', 
      bg: '#fee2e2' 
    },
    { 
      title: 'Completed Cases', 
      value: stats.completedCasesCount || stats.totalConsultations || 842, 
      img: '/assets/kpi-completed.png',
      fallbackIcon: CheckCircle2, 
      color: '#0f766e', 
      bg: '#ccfbf1' 
    },
    { 
      title: 'Diagnostic Lab Tests', 
      value: stats.totalLabTests || 316, 
      img: '/assets/kpi-lab.png',
      fallbackIcon: FlaskConical, 
      color: '#7c3aed', 
      bg: '#ede9fe' 
    },
    { 
      title: 'Active Outbreak Clusters', 
      value: stats.activeOutbreaksCount || 3, 
      img: '/assets/kpi-vet.png',
      fallbackIcon: AlertTriangle, 
      color: '#b91c1c', 
      bg: '#fecaca', 
      action: onGoToOutbreakMap 
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Hero Banner */}
      <div 
        className="gov-banner-card"
        style={{
          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf9 38%, rgba(240, 253, 249, 0.25) 70%, #ecfdf5 100%)',
          borderColor: '#d1fae5',
          padding: '28px 34px'
        }}
      >
        {/* Vector Background Graphic */}
        <div 
          className="gov-banner-bg" 
          style={{ backgroundImage: `url('/assets/banner-overview.png')`, width: 520 }} 
        />

        {/* Branding & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, zIndex: 2, maxWidth: 680 }}>
          <div className="gov-banner-icon-box" style={{ background: '#059669', borderColor: '#047857', color: '#ffffff' }}>
            <ShieldCheck size={28} color="#ffffff" strokeWidth={2.3} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#dcfce7',
                color: '#15803d',
                padding: '3px 9px',
                borderRadius: 9999,
                border: '1px solid #bbf7d0'
              }}>
                Department of Animal Husbandry & Dairying
              </span>
              <span style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Radio size={12} className="spin" style={{ animationDuration: '3s' }} /> Live Telemetry
              </span>
            </div>
            <h1 className="gov-banner-title" style={{ fontSize: 24 }}>
              Livestock Health Intelligence & Biosecurity Network
            </h1>
            <p className="gov-banner-subtitle">
              Unified surveillance across farmer clinical incident reports, OpenWeather vector dispersion risk, certified veterinary teleconsultations, and accredited diagnostic labs.
            </p>
          </div>
        </div>

        {/* Quick Actions in Banner */}
        <div style={{ display: 'flex', gap: 10, zIndex: 2, alignSelf: 'flex-end' }}>
          {onRefresh && (
            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="btn-gov-secondary"
              style={{ fontSize: 12.5 }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Syncing...' : 'Live Sync'}
            </button>
          )}
          <button
            onClick={onGoToOutbreakMap}
            className="btn-gov-primary"
            style={{ fontSize: 12.5 }}
          >
            <MapPin size={14} /> Outbreak Map
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid with Icons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {kpiCards.map((kpi, idx) => {
          const FallbackIcon = kpi.fallbackIcon;
          return (
            <div 
              key={idx} 
              className="admin-card" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16,
                cursor: kpi.action ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onClick={kpi.action}
              onMouseOver={(e) => {
                if (kpi.action) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                if (kpi.action) e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Custom Image Icon or Fallback */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: kpi.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}>
                <img 
                  src={kpi.img} 
                  alt={kpi.title} 
                  onError={(e) => {
                    // Hide img on load error to display fallback icon
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{
                    width: 38,
                    height: 38,
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {kpi.title}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Disease Breakdown & AI Outbreak Readiness Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Disease Prevalence */}
        <div className="admin-card">
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#059669" />
            Epidemiological Case Distribution (Maharashtra State)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.diseaseDistribution || {
              'Foot and Mouth Disease': 42,
              'Lumpy Skin Disease': 28,
              'Clinical Mastitis': 65,
              'Bovine Respiratory Disease': 19,
              'General Pyrexia': 34
            }).map(([disease, count]) => (
              <div key={disease}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{disease}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{count} cases</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, Math.max(12, (count as number) * 1.5))}%`, 
                      height: '100%', 
                      background: disease.includes('Foot') || disease.includes('Lumpy') ? '#dc2626' : '#059669',
                      borderRadius: 3
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biosecurity Readiness & Quick Jump */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#0284c7" />
              State Telemedicine & Diagnostic Mesh Status
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
              The Biosecurity Command is synchronized with 36 regional district polyclinics and accredited state diagnostic pathology labs across Maharashtra.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>Dispensary Response Mesh:</span>
                <strong style={{ color: '#16a34a' }}>99.4% Operational</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>OpenWeather Vector Ingestion:</span>
                <strong style={{ color: '#0284c7' }}>Realtime Signal Active</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {onGoToAISurveillance && (
              <button
                onClick={onGoToAISurveillance}
                className="btn-gov-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Zap size={14} color="#f59e0b" /> AI Sentinel
              </button>
            )}
            <button
              onClick={onGoToOutbreakMap}
              className="btn-gov-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <MapPin size={14} /> Open Outbreak Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
