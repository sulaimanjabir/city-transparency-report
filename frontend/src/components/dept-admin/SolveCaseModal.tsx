import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { markSolved } from '@/api/dept-admin.api';

interface Props {
  caseId: string;
  complaintTypeName: string;
  open: boolean;
  onClose: () => void;
  onSolved: () => void;
}

export default function SolveCaseModal({ caseId, complaintTypeName, open, onClose, onSolved }: Props) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) { toast.error('Please provide a photo URL as proof'); return; }
    setLoading(true);
    try {
      await markSolved(caseId, photoUrl);
      toast.success('Case marked as solved — citizens will now verify');
      onSolved();
      onClose();
      setPhotoUrl('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to mark as solved');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Case as Solved</DialogTitle>
          <DialogDescription>
            Upload photo proof that <strong>{complaintTypeName}</strong> has been resolved.
            Citizens will be notified to verify.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photoUrl">Photo URL (proof of resolution)</Label>
            <Input
              id="photoUrl"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Upload the photo to any image host and paste the link here.
            </p>
          </div>

          {photoUrl && (
            <div className="rounded-lg overflow-hidden border bg-muted">
              <img
                src={photoUrl}
                alt="Preview"
                className="w-full object-cover max-h-40"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? 'Submitting...' : 'Mark as Solved'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
