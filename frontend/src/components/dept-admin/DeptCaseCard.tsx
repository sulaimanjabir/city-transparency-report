import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/cases/StatusBadge';
import SolveCaseModal from './SolveCaseModal';
import { markInProgress } from '@/api/dept-admin.api';

interface Props {
  caseData: any;
  onRefresh: () => void;
}

export default function DeptCaseCard({ caseData, onRefresh }: Props) {
  const [solveOpen, setSolveOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const ct = typeof caseData.complaintTypeId === 'object' ? caseData.complaintTypeId : null;
  const ctName = ct?.name ?? 'Unknown Type';

  const totalVotes = caseData.resolvedVotes + caseData.notResolvedVotes;
  const resolvedPct = totalVotes > 0 ? Math.round((caseData.resolvedVotes / totalVotes) * 100) : 0;

  const handleMarkInProgress = async () => {
    setLoadingProgress(true);
    try {
      await markInProgress(caseData._id);
      toast.success('Case marked as in progress');
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed');
    } finally {
      setLoadingProgress(false);
    }
  };

  return (
    <>
      <Card className={`border transition-shadow hover:shadow-md ${caseData.status === 'disputed' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{ctName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(caseData.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <StatusBadge status={caseData.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <strong className="text-gray-700">{caseData.reportCount}</strong> citizen{caseData.reportCount !== 1 ? 's' : ''} affected
            </span>
          </div>

          {/* Vote progress (verifying / resolved / disputed) */}
          {['verifying', 'resolved', 'disputed'].includes(caseData.status) && totalVotes > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{caseData.resolvedVotes} verified resolved</span>
                <span>{resolvedPct}%</span>
                <span>{caseData.notResolvedVotes} disputed</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${resolvedPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{totalVotes} of {caseData.reportCount} citizens voted</p>
            </div>
          )}

          {/* Disputed permanent banner */}
          {caseData.status === 'disputed' && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-100 border border-red-300 rounded-lg">
              <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-red-700">DISPUTED — Community rejected resolution</p>
                <p className="text-xs text-red-600 mt-0.5">You must fix this issue and mark it as solved again.</p>
              </div>
            </div>
          )}

          {/* Resolved banner */}
          {caseData.status === 'resolved' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified by community — archived
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {caseData.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={handleMarkInProgress} disabled={loadingProgress}
                className="text-blue-700 border-blue-200 hover:bg-blue-50">
                {loadingProgress ? 'Updating...' : 'Mark In Progress'}
              </Button>
            )}
            {(caseData.status === 'verifying_in_progress' || caseData.status === 'disputed') && (
              <Button size="sm" onClick={() => setSolveOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {caseData.status === 'disputed' ? 'Re-attempt Solution' : 'Mark as Solved'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SolveCaseModal
        open={solveOpen}
        onClose={() => setSolveOpen(false)}
        caseId={caseData._id}
        complaintTypeName={ctName}
        onSolved={onRefresh}
      />
    </>
  );
}
