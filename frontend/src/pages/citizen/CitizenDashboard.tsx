import { useState, useEffect, useCallback } from 'react';
import CitizenLayout from '@/components/layout/CitizenLayout';
import ComplaintCard from '@/components/cases/ComplaintCard';
import SubmitComplaintFAB from '@/components/cases/SubmitComplaintFAB';
import InitiativeCard from '@/components/initiatives/InitiativeCard';
import { getCityFeed, getMyCases } from '@/api/cases.api';
import { getCities } from '@/api/departments.api';
import { getCityInitiatives } from '@/api/initiatives.api';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState<'feed' | 'my' | 'initiatives'>('feed');
  const [cases, setCases] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<{ _id: string; name: string } | null>(null);

  useEffect(() => {
    getCities().then((cities) => {
      if (cities.length > 0) setCity(cities[0]);
    });
  }, []);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'feed' && city) {
        const data = await getCityFeed(city._id);
        setCases(data);
      } else if (activeTab === 'my') {
        const data = await getMyCases();
        setCases(data);
      } else if (activeTab === 'initiatives' && city) {
        const data = await getCityInitiatives(city._id);
        setInitiatives(data);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, city]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const feedCases = cases;
  const myCasesData = activeTab === 'my' ? cases : [];

  return (
    <CitizenLayout activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setCases([]); setInitiatives([]); }}>
      <div className="p-6 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          {activeTab === 'feed' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">City Transparency Feed</h1>
              <p className="text-muted-foreground mt-1 text-sm">All active complaints in Mardan — sorted by community reports</p>
            </>
          )}
          {activeTab === 'my' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
              <p className="text-muted-foreground mt-1 text-sm">Complaints you have filed or joined</p>
            </>
          )}
          {activeTab === 'initiatives' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">Department Initiatives</h1>
              <p className="text-muted-foreground mt-1 text-sm">Support civic projects and rate their outcomes</p>
            </>
          )}
        </div>

        {/* Initiatives tab */}
        {activeTab === 'initiatives' && (
          loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : initiatives.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <p className="font-medium">No initiatives yet</p>
              <p className="text-sm mt-1">Departments haven't posted any initiatives yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-4 pr-2">
                {initiatives.map((initiative) => (
                  <InitiativeCard key={initiative._id} initiative={initiative} onRefresh={fetchCases} />
                ))}
              </div>
            </ScrollArea>
          )
        )}

        {/* Cases list (feed + my) */}
        {activeTab !== 'initiatives' && (
          loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (activeTab === 'feed' ? feedCases : myCasesData).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              <p className="font-medium">No complaints yet</p>
              <p className="text-sm mt-1">
                {activeTab === 'feed' ? 'Be the first to report an issue in your city.' : 'Use the + button to file your first complaint.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-4 pr-2">
                {(activeTab === 'feed' ? feedCases : myCasesData).map((item: any) => {
                  const caseData = activeTab === 'my' ? item.masterCaseId : item;
                  if (!caseData) return null;
                  return (
                    <ComplaintCard
                      key={activeTab === 'my' ? item._id : caseData._id}
                      caseData={caseData}
                      onRefresh={fetchCases}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          )
        )}
      </div>

      {/* FAB */}
      {city && (
        <SubmitComplaintFAB
          cityId={city._id}
          cityName={city.name}
          onSubmitted={fetchCases}
        />
      )}
    </CitizenLayout>
  );
}
