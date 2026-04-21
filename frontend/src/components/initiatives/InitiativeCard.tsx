import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { donateToInitiative, voteSatisfaction, getDonationStatus, getSatisfactionStatus } from '@/api/initiatives.api';

interface Initiative {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'open' | 'completed';
  departmentId: { _id: string; name: string } | string;
  proofUrl?: string;
  expenseBreakdown?: string;
  satisfiedCount: number;
  notSatisfiedCount: number;
  donorIds: string[];
  createdAt: string;
}

interface Props {
  initiative: Initiative;
  onRefresh: () => void;
}

export default function InitiativeCard({ initiative, onRefresh }: Props) {
  const [donateOpen, setDonateOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);
  const [hasVotedSatisfaction, setHasVotedSatisfaction] = useState(false);

  const dept = typeof initiative.departmentId === 'object' ? initiative.departmentId : null;
  const progressPct = initiative.targetAmount > 0
    ? Math.min(100, Math.round((initiative.raisedAmount / initiative.targetAmount) * 100))
    : 0;
  const totalSatisfactionVotes = initiative.satisfiedCount + initiative.notSatisfiedCount;
  const satisfiedPct = totalSatisfactionVotes > 0
    ? Math.round((initiative.satisfiedCount / totalSatisfactionVotes) * 100)
    : 0;

  useEffect(() => {
    getDonationStatus(initiative._id).then((s) => setHasDonated(s.hasDonated));
    if (initiative.status === 'completed') {
      getSatisfactionStatus(initiative._id).then((s) => setHasVotedSatisfaction(s.hasVoted));
    }
  }, [initiative._id, initiative.status]);

  const handleDonate = async () => {
    const amt = Number(amount);
    if (!amt || amt < 1) { toast.error('Enter a valid amount'); return; }
    setDonating(true);
    try {
      await donateToInitiative(initiative._id, amt);
      toast.success(`PKR ${amt.toLocaleString()} donated successfully`);
      setHasDonated(true);
      setDonateOpen(false);
      setAmount('');
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  const handleSatisfactionVote = async (value: 'satisfied' | 'not_satisfied') => {
    setVoting(true);
    try {
      await voteSatisfaction(initiative._id, value);
      toast.success(value === 'satisfied' ? 'Marked as satisfied!' : 'Feedback recorded');
      setHasVotedSatisfaction(true);
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {dept?.name ?? 'Department'}
              </p>
              <h3 className="font-semibold text-gray-900 mt-0.5">{initiative.title}</h3>
            </div>
            <Badge className={initiative.status === 'completed'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-blue-100 text-blue-700 border-blue-200'}>
              {initiative.status === 'completed' ? 'Completed' : 'Open'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{initiative.description}</p>

          {/* Funding progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>PKR {initiative.raisedAmount.toLocaleString()} raised</span>
              <span>{progressPct}%</span>
              <span>Goal: PKR {initiative.targetAmount.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{initiative.donorIds.length} donor{initiative.donorIds.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Proof section */}
          {initiative.status === 'completed' && initiative.proofUrl && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Proof of Work</p>
              <img
                src={initiative.proofUrl}
                alt="Proof of work"
                className="w-full max-h-48 object-cover rounded-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <p className="text-xs text-green-700"><span className="font-medium">Expense breakdown:</span> {initiative.expenseBreakdown}</p>
            </div>
          )}

          {/* Satisfaction votes */}
          {initiative.status === 'completed' && totalSatisfactionVotes > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{initiative.satisfiedCount} satisfied</span>
                <span>{satisfiedPct}%</span>
                <span>{initiative.notSatisfiedCount} not satisfied</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${satisfiedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {initiative.status === 'open' && !hasDonated && (
              <Button size="sm" onClick={() => setDonateOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white">
                Donate
              </Button>
            )}
            {initiative.status === 'open' && hasDonated && (
              <span className="text-xs text-green-600 font-medium self-center">✓ You donated to this</span>
            )}
            {initiative.status === 'completed' && hasDonated && !hasVotedSatisfaction && (
              <>
                <Button size="sm" disabled={voting} onClick={() => handleSatisfactionVote('satisfied')}
                  className="bg-green-600 hover:bg-green-700 text-white">
                  Satisfied
                </Button>
                <Button size="sm" disabled={voting} variant="outline" onClick={() => handleSatisfactionVote('not_satisfied')}
                  className="border-red-200 text-red-600 hover:bg-red-50">
                  Not Satisfied
                </Button>
              </>
            )}
            {initiative.status === 'completed' && hasDonated && hasVotedSatisfaction && (
              <span className="text-xs text-muted-foreground self-center">✓ You rated this initiative</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donate Modal */}
      <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Donate to Initiative</DialogTitle>
            <DialogDescription>{initiative.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (PKR)</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDonateOpen(false)} className="flex-1">Cancel</Button>
              <Button disabled={donating} onClick={handleDonate} className="flex-1 bg-blue-700 hover:bg-blue-800">
                {donating ? 'Processing...' : 'Confirm Donation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
