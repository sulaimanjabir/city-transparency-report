import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { castVote } from '@/api/cases.api';

interface Props {
  caseId: string;
  departmentName: string;
  complaintTypeName: string;
  solvedPhotoUrl?: string;
  open: boolean;
  onClose: () => void;
  onVoted: () => void;
}

export default function VoteModal({ caseId, departmentName, complaintTypeName, solvedPhotoUrl, open, onClose, onVoted }: Props) {
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 'resolved' | 'not_resolved') => {
    setLoading(true);
    try {
      await castVote(caseId, value);
      toast.success(value === 'resolved' ? 'Voted: Resolved ✓' : 'Voted: Not Resolved');
      onVoted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Vote failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Resolution</DialogTitle>
          <DialogDescription>
            The <strong>{departmentName}</strong> department claims the <strong>{complaintTypeName}</strong> issue has been resolved.
          </DialogDescription>
        </DialogHeader>

        {solvedPhotoUrl && (
          <div className="rounded-lg overflow-hidden border bg-gray-50">
            <img src={solvedPhotoUrl} alt="Proof of resolution" className="w-full object-cover max-h-48" />
            <p className="text-xs text-center text-muted-foreground py-2">Photo submitted by department</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Has this issue been resolved in your area? Your vote helps determine the outcome.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={() => handleVote('resolved')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Yes, it's fixed
          </Button>
          <Button
            onClick={() => handleVote('not_resolved')}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Not resolved
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
