import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles,
  UserCheck, 
  MapPin, 
  Siren,
  Store,
  FileText, 
  Activity, 
  FlaskConical, 
  Shield,
  ShieldCheck
} from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingVetCount: number;
  emergencyDutyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  pendingVetCount,
  emergencyDutyCount 
}) => {
  const items: { id: AdminTab; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Surveillance Overview', icon: LayoutDashboard },
    { id: 'ai-surveillance', label: 'Pashu AI Intelligence', icon: Sparkles, badge: 3, badgeColor: '#8b5cf6' },
    { id: 'outbreak-map', label: 'Outbreak Intelligence Map', icon: MapPin },
    { id: 'emergency-dispatch', label: 'Emergency Vet Dispatch', icon: Siren, badge: emergencyDutyCount && emergencyDutyCount > 0 ? emergencyDutyCount : undefined, badgeColor: '#ef4444' },
    { id: 'marketplace-verification', label: 'Trade & Marketplace', icon: Store },
    { id: 'vet-verification', label: 'Vet Credentialing', icon: UserCheck, badge: pendingVetCount > 0 ? pendingVetCount : 2, badgeColor: '#f59e0b' },
    { id: 'medical-dossier', label: 'Livestock Dossier & PDF', icon: FileText },
    { id: 'cases', label: 'Telemedicine & Cases', icon: Activity },
    { id: 'lab-surveillance', label: 'Laboratory Operations', icon: FlaskConical },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: Shield },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26, paddingLeft: 4 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
          flexShrink: 0
        }}>
          <img src="/assets/app_logo.png" alt="Pashu Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            DAHD SURVEILLANCE
          </div>
          <div style={{ fontSize: 9.5, color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Government of Maharashtra
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, zIndex: 2 }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#047857' : '#475569',
                backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                borderLeft: isActive ? '3px solid #059669' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Icon size={17} color={isActive ? '#059669' : '#64748b'} strokeWidth={isActive ? 2.2 : 2} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: item.badgeColor || '#f59e0b',
                  color: '#ffffff',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 9999,
                  minWidth: 18,
                  textAlign: 'center',
                  boxShadow: '0 1px 4px rgba(245, 158, 11, 0.3)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Gateway of India Illustration and Biosecurity Telemetry Footer */}
      <div style={{ position: 'relative', marginTop: 'auto', paddingTop: 16 }}>
        {/* Gateway of India Graphic Backdrop */}
        <div 
          style={{
            position: 'absolute',
            bottom: 60,
            left: -14,
            right: -14,
            height: 140,
            backgroundImage: `url('/assets/sidebar-gateway-maharashtra.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'left bottom',
            backgroundRepeat: 'no-repeat',
            opacity: 0.85,
            pointerEvents: 'none'
          }}
        />

        {/* Biosecurity Command Status Card */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '12px 14px',
          backgroundColor: '#f0fdf4',
          borderRadius: 10,
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <ShieldCheck size={15} color="#059669" strokeWidth={2.5} />
            <span style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700 }}>
              Biosecurity Command Center
            </span>
          </div>
          <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 12, lineHeight: 1.3 }}>
            National Livestock Health Mesh
          </div>
          <div style={{ color: '#16a34a', fontSize: 10.5, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            Live Spatial Telemetry Active
          </div>
        </div>
      </div>
    </aside>
  );
};
