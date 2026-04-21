import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createInitiative } from '@/api/initiatives.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateInitiativeModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState({ title: '', description: '', targetAmount: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.targetAmount);
    if (!amount || amount < 1) { toast.error('Enter a valid target amount'); return; }
    if (form.description.length < 20) { toast.error('Description too short (min 20 characters)'); return; }
    setLoading(true);
    try {
      await createInitiative({ title: form.title, description: form.description, targetAmount: amount });
      toast.success('Initiative created successfully');
      setForm({ title: '', description: '', targetAmount: '' });
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create initiative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Initiative</DialogTitle>
          <DialogDescription>Publish a new project for citizens to support</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Repair of Gulshan Street Lights"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-xs text-muted-foreground">({form.description.length}/500)</span></Label>
            <Textarea
              placeholder="Describe the planned work, timeline, and expected outcome..."
              value={form.description}
              maxLength={500}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Target Amount (PKR)</Label>
            <Input
              type="number"
              placeholder="e.g. 150000"
              min={1}
              value={form.targetAmount}
              onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-700 hover:bg-blue-800">
              {loading ? 'Publishing...' : 'Publish Initiative'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
