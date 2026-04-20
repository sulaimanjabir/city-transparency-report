import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { joinCase } from '@/api/cases.api';

interface Props {
  caseId: string;
  departmentName: string;
  complaintTypeName: string;
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export default function JoinCaseModal({ caseId, departmentName, complaintTypeName, open, onClose, onJoined }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', location: '', isAnonymous: false });
  const charCount = form.description.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (charCount < 10) { toast.error('Description too short (min 10 characters)'); return; }
    setLoading(true);
    try {
      await joinCase(caseId, form);
      toast.success('You have joined this case');
      onJoined();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to join case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Same Issue</DialogTitle>
          <DialogDescription>
            Joining: <strong>{departmentName}</strong> → {complaintTypeName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Description</Label>
              <span className={`text-xs ${charCount < 10 ? 'text-red-500' : charCount > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount}/100
              </span>
            </div>
            <Textarea
              placeholder="Describe the issue you're facing..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              maxLength={100}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Exact Location</Label>
            <Input
              placeholder="e.g. House #45, Gulshan Street"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Submit anonymously</p>
              <p className="text-xs text-muted-foreground">Your name won't be shown publicly</p>
            </div>
            <Switch
              checked={form.isAnonymous}
              onCheckedChange={(v) => setForm((p) => ({ ...p, isAnonymous: v }))}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-700 hover:bg-blue-800">
              {loading ? 'Joining...' : 'I have this problem too'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
