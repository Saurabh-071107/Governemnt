import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { VetVerificationView } from './components/VetVerificationView';
import { OutbreakSurveillanceView } from './components/OutbreakSurveillanceView';
import { AnimalDossierView } from './components/AnimalDossierView';
import { AuditLogsView } from './components/AuditLogsView';
import { EmergencyDispatchView } from './components/EmergencyDispatchView';
import { AISurveillanceIntelligenceView } from './components/AISurveillanceIntelligenceView';
import { MarketplaceVerificationView } from './components/MarketplaceVerificationView';
import { AdminApiService, SOCKET_URL } from './services/api';
import { AdminTab, AdminKPIs, VeterinarianRecord } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminKPIs>({
    farmersCount: 0,
    animalsCount: 0,
    totalVets: 0,
    verifiedVetsCount: 0,
    pendingVetsCount: 0,
    rejectedVetsCount: 0,
    activeCasesCount: 0,
    completedCasesCount: 0,
    totalConsultations: 0,
    totalLabTests: 0,
    activeOutbreaksCount: 0,
    diseaseDistribution: {
      'Foot and Mouth Disease': 0,
      'Lumpy Skin Disease': 0,
      'Clinical Mastitis': 0,
      'Bovine Respiratory Disease': 0,
      'General Pyrexia': 0
    }
  });
  const [vets, setVets] = useState<VeterinarianRecord[]>([]);
  const [emergencyDutyCount, setEmergencyDutyCount] = useState(0);

  const loadData = async () => {
    const [statsData, vetsData] = await Promise.all([
      AdminApiService.fetchStats(),
      AdminApiService.fetchVets()
    ]);
    if (statsData) setStats(statsData);
    if (vetsData) setVets(vetsData);
    // Also refresh emergency duty count
    try {
      const edData = await AdminApiService.fetchEmergencyDutyVets();
      setEmergencyDutyCount(edData.count);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
    // 1. Periodic background polling every 8 seconds
    const interval = setInterval(loadData, 8000);

    // 2. Real-time WebSocket event listener for instant push
    let socket: any = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000
      });

      socket.on('kpi_update', (payload: any) => {
        console.log('[Gov Admin] Live real-time KPI update received:', payload);
        loadData();
      });
    } catch (err) {
      console.warn('[Socket.io connection notice]', err);
    }

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, []);


  const handleVerifyVet = async (vetId: string, status: 'VERIFIED' | 'REJECTED', reason: string = '') => {
    const res = await AdminApiService.verifyVet(vetId, status, reason);
    setVets(prev => prev.map(v => {
      if (v.id === vetId) {
        return {
          ...v,
          verificationStatus: status,
          rejectionReason: reason,
          assignedTempPassword: res.credentials?.password || v.assignedTempPassword,
          verifiedAt: new Date().toISOString()
        };
      }
      return v;
    }));
    await loadData();
    return res;
  };

  const pendingVetCount = vets.filter(v => v.verificationStatus === 'PENDING' || (!v.verificationStatus && v.verificationStatus !== 'VERIFIED')).length;

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingVetCount={pendingVetCount}
        emergencyDutyCount={emergencyDutyCount}
      />

      <div className="admin-content">
        <Header onRefresh={loadData} />

        <main className="admin-body">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
              onGoToAISurveillance={() => setActiveTab('ai-surveillance')}
              onGoToMarketplaceVerification={() => setActiveTab('marketplace-verification')}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'vet-verification' && (
            <VetVerificationView
              vets={vets}
              onVerifyVet={handleVerifyVet}
            />
          )}

          {activeTab === 'ai-surveillance' && (
            <AISurveillanceIntelligenceView />
          )}

          {activeTab === 'outbreak-map' && (
            <OutbreakSurveillanceView />
          )}

          {activeTab === 'emergency-dispatch' && (
            <EmergencyDispatchView />
          )}

          {activeTab === 'marketplace-verification' && (
            <MarketplaceVerificationView
              onInspectAnimalTag={(tag) => {
                setActiveTab('medical-dossier');
              }}
            />
          )}

          {activeTab === 'medical-dossier' && (
            <AnimalDossierView />
          )}

          {activeTab === 'cases' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
              onGoToAISurveillance={() => setActiveTab('ai-surveillance')}
            />
          )}

          {activeTab === 'lab-surveillance' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
              onGoToAISurveillance={() => setActiveTab('ai-surveillance')}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
