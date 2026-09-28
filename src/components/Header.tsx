import React from 'react';
import { Bell, ShieldCheck, RefreshCw, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="admin-header">
      {/* Left: State Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img 
          src="/assets/app_logo.png" 
          alt="Pashu Seva Logo" 
          style={{ height: 44, width: 44, objectFit: 'contain', borderRadius: '50%' }} 
        />
        <img 
          src="/assets/state_seal.png" 
          alt="Government of Maharashtra Seal" 
          style={{ height: 44, width: 44, objectFit: 'contain' }} 
        />
        <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 16, marginRight: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
            Government of Maharashtra
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', letterSpacing: '0.02em' }}>
            महाराष्ट्र शासन
          </div>
        </div>

        {/* Center: Command Portal Title & Biosecurity Tier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            National Animal Disease Surveillance & Telemedicine Command
          </h1>
          <span 
            className="badge-verified" 
            style={{ 
              fontSize: 11, 
              padding: '3px 10px', 
              background: '#ecfdf5', 
              color: '#047857', 
              borderColor: '#a7f3d0' 
            }}
          >
            <ShieldCheck size={13} strokeWidth={2.5} /> Integrated Biosecurity Level 4
          </span>
        </div>
      </div>

      {/* Right: Actions & Commissioner Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Notification Bell */}
        <button
          type="button"
          title="Command Notifications"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569'
          }}
        >
          <Bell size={17} />
        </button>

        {/* Refresh Feed */}
        <button
          onClick={onRefresh}
          className="btn-gov-secondary"
          style={{ fontSize: 12, padding: '7px 12px', gap: 6 }}
        >
          <RefreshCw size={13} />
          Refresh Feed
        </button>

        {/* Commissioner Profile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          paddingLeft: 6,
          cursor: 'pointer' 
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#047857',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 13,
            boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)'
          }}>
            SK
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              State Veterinary Commissioner
            </div>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>
              Department of Animal Husbandry
            </div>
          </div>
          <ChevronDown size={14} color="#64748b" />
        </div>
      </div>
    </header>
  );
};
