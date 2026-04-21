import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import VoteModal from './VoteModal';
import JoinCaseModal from './JoinCaseModal';
import { useAuthStore } from '@/store/auth.store';
import { getVoteStatus } from '@/api/cases.api';

interface MasterCase {
  _id: string;
  status: string;
  reportCount: number;
  resolvedVotes: number;
  notResolvedVotes: number;
  solvedPhotoUrl?: string;
  reporterIds: string[];
  departmentId: { _id: string; name: string } | string;
  complaintTypeId: { _id: string; name: string } | string;
  createdAt: string;
}

interface Props {
  caseData: MasterCase;
  onRefresh: () => void;
}

export default function ComplaintCard({ caseData, onRefresh }: Props) {
  const { user } = useAuthStore();
  const [voteOpen, setVoteOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (user && caseData.status === 'verifying') {
      getVoteStatus(caseData._id).then((s) => setHasVoted(s.hasVoted));
    }
  }, [caseData._id, caseData.status, user]);

  const dept = typeof caseData.departmentId === 'object' ? caseData.departmentId : null;
  const ct = typeof caseData.complaintTypeId === 'object' ? caseData.complaintTypeId : null;
  const deptName = dept?.name ?? 'Unknown Department';
  const ctName = ct?.name ?? 'Unknown Type';

  const isReporter = user ? caseData.reporterIds.includes(user.id) : false;
  const canJoin = !isReporter && ['pending', 'verifying_in_progress', 'verifying'].includes(caseData.status);
  const canVote = isReporter && caseData.status === 'verifying' && !hasVoted;

  const totalVotes = caseData.resolvedVotes + caseData.notResolvedVotes;
  const resolvedPct = totalVotes > 0 ? Math.round((caseData.resolvedVotes / totalVotes) * 100) : 0;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{deptName}</p>
              <h3 className="font-semibold text-gray-900 mt-0.5">{ctName}</h3>
            </div>
            <StatusBadge status={caseData.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <strong className="text-gray-700">{caseData.reportCount}</strong> reporter{caseData.reportCount !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-300">•</span>
            <span>{new Date(caseData.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Vote progress bar — only show when verifying or after */}
          {['verifying', 'resolved', 'disputed'].includes(caseData.status) && totalVotes > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{caseData.resolvedVotes} resolved</span>
                <span>{resolvedPct}%</span>
                <span>{caseData.notResolvedVotes} disputed</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${resolvedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Disputed banner */}
          {caseData.status === 'disputed' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Community rejected this resolution — awaiting official re-attempt
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {canJoin && (
              <Button size="sm" variant="outline" onClick={() => setJoinOpen(true)} className="text-blue-700 border-blue-200 hover:bg-blue-50">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                I have this problem too
              </Button>
            )}
            {canVote && (
              <Button size="sm" onClick={() => setVoteOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify Resolution
              </Button>
            )}
            {isReporter && caseData.status === 'verifying' && (
              <span className="text-xs text-muted-foreground self-center ml-1">You can verify this</span>
            )}
          </div>
        </CardContent>
      </Card>

      <VoteModal
        open={voteOpen}
        onClose={() => setVoteOpen(false)}
        caseId={caseData._id}
        departmentName={deptName}
        complaintTypeName={ctName}
        solvedPhotoUrl={caseData.solvedPhotoUrl}
        onVoted={() => { setHasVoted(true); onRefresh(); }}
      />

      <JoinCaseModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        caseId={caseData._id}
        departmentName={deptName}
        complaintTypeName={ctName}
        onJoined={onRefresh}
      />
    </>
  );
}
