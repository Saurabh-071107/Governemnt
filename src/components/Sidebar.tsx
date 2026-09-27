import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  MapPin, 
  FileText, 
  Activity, 
  FlaskConical, 
  ShieldAlert,
  Shield,
  Layers
} from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingVetCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, pendingVetCount }) => {
  const items = [
    { id: 'overview', label: 'Surveillance Overview', icon: LayoutDashboard },
    { id: 'vet-verification', label: 'Vet Credentialing', icon: UserCheck, badge: pendingVetCount },
    { id: 'outbreak-map', label: 'Outbreak Intelligence Map', icon: MapPin },
    { id: 'medical-dossier', label: 'Livestock Dossier & PDF', icon: FileText },
    { id: 'cases', label: 'Telemedicine & Cases', icon: Activity },
    { id: 'lab-surveillance', label: 'Laboratory Operations', icon: FlaskConical },
    { id: 'audit-logs', label: 'Security & Audit Logs', icon: Shield },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, paddingLeft: 8 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.4)'
        }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            DAHD SURVEILLANCE
          </div>
          <div style={{ fontSize: 10, color: '#2dd4bf', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Government of India
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => onTabChange(item.id as AdminTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                borderLeft: isActive ? '3px solid #2dd4bf' : '3px solid transparent',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} color={isActive ? '#2dd4bf' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: '#d97706',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 9999
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Terminal Footer */}
      <div style={{
        padding: '14px',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        border: '1px solid #334155',
        fontSize: 12
      }}>
        <div style={{ color: '#94a3b8', fontSize: 11 }}>Biosecurity Command Center</div>
        <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: 2 }}>National Livestock Health Mesh</div>
        <div style={{ color: '#2dd4bf', fontSize: 10, marginTop: 4 }}>● Live Spatial Telemetry Active</div>
      </div>
    </aside>
  );
};
