import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { VetVerificationView } from './components/VetVerificationView';
import { OutbreakSurveillanceView } from './components/OutbreakSurveillanceView';
import { AnimalDossierView } from './components/AnimalDossierView';
import { AuditLogsView } from './components/AuditLogsView';
import { AdminApiService } from './services/api';
import { AdminTab, AdminKPIs, VeterinarianRecord } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminKPIs>({
    farmersCount: 18,
    animalsCount: 42,
    totalVets: 8,
    verifiedVetsCount: 5,
    pendingVetsCount: 2,
    rejectedVetsCount: 1,
    activeCasesCount: 7,
    completedCasesCount: 29,
    totalConsultations: 34,
    totalLabTests: 19,
    activeOutbreaksCount: 2,
    diseaseDistribution: {
      'Foot and Mouth Disease': 4,
      'Lumpy Skin Disease': 3,
      'Clinical Mastitis': 6,
      'Bovine Respiratory Disease': 2,
      'General Pyrexia': 5
    }
  });
  const [vets, setVets] = useState<VeterinarianRecord[]>([]);

  const loadData = async () => {
    const [statsData, vetsData] = await Promise.all([
      AdminApiService.fetchStats(),
      AdminApiService.fetchVets()
    ]);
    if (statsData) setStats(statsData);
    if (vetsData) setVets(vetsData);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [activeTab]);


  const handleVerifyVet = async (vetId: string, status: 'VERIFIED' | 'REJECTED', reason: string = '') => {
    await AdminApiService.verifyVet(vetId, status, reason);
    setVets(prev => prev.map(v => {
      if (v.id === vetId) {
        return {
          ...v,
          verificationStatus: status,
          rejectionReason: reason,
          verifiedAt: new Date().toISOString()
        };
      }
      return v;
    }));
    await loadData();
  };

  const pendingVetCount = vets.filter(v => v.verificationStatus === 'PENDING' || (!v.verificationStatus && v.verificationStatus !== 'VERIFIED')).length;

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingVetCount={pendingVetCount}
      />

      <div className="admin-content">
        <Header onRefresh={loadData} />

        <main className="admin-body">
          {activeTab === 'overview' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
            />
          )}

          {activeTab === 'vet-verification' && (
            <VetVerificationView
              vets={vets}
              onVerifyVet={handleVerifyVet}
            />
          )}

          {activeTab === 'outbreak-map' && (
            <OutbreakSurveillanceView />
          )}

          {activeTab === 'medical-dossier' && (
            <AnimalDossierView />
          )}

          {activeTab === 'cases' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
            />
          )}

          {activeTab === 'lab-surveillance' && (
            <OverviewView
              stats={stats}
              onGoToVetVerification={() => setActiveTab('vet-verification')}
              onGoToOutbreakMap={() => setActiveTab('outbreak-map')}
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
