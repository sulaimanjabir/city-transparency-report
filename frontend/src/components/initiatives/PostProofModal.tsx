import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { postInitiativeProof } from '@/api/initiatives.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
  initiativeId: string;
  initiativeTitle: string;
}

export default function PostProofModal({ open, onClose, onPosted, initiativeId, initiativeTitle }: Props) {
  const [form, setForm] = useState({ proofUrl: '', expenseBreakdown: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.expenseBreakdown.length < 10) { toast.error('Expense breakdown too short'); return; }
    setLoading(true);
    try {
      await postInitiativeProof(initiativeId, form);
      toast.success('Proof posted — citizens can now rate this initiative');
      setForm({ proofUrl: '', expenseBreakdown: '' });
      onPosted();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to post proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post Proof of Work</DialogTitle>
          <DialogDescription>{initiativeTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Proof Image URL</Label>
            <Input
              placeholder="https://i.ibb.co/..."
              value={form.proofUrl}
              onChange={(e) => setForm((f) => ({ ...f, proofUrl: e.target.value }))}
              required
            />
            {form.proofUrl && (
              <img
                src={form.proofUrl}
                alt="Preview"
                className="w-full max-h-40 object-cover rounded-lg border mt-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Expense Breakdown</Label>
            <Textarea
              placeholder="e.g. Materials: PKR 80,000 | Labour: PKR 40,000 | Misc: PKR 10,000"
              value={form.expenseBreakdown}
              maxLength={500}
              rows={3}
              onChange={(e) => setForm((f) => ({ ...f, expenseBreakdown: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? 'Posting...' : 'Mark as Completed'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
