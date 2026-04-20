import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartments, getComplaintTypes } from '@/api/departments.api';
import { submitComplaint } from '@/api/cases.api';

const STEPS = ['City', 'Department', 'Complaint Type', 'Details'];

interface Props {
  cityId: string;
  cityName: string;
  onSubmitted: () => void;
}

export default function SubmitComplaintFAB({ cityId, cityName, onSubmitted }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [complaintTypes, setComplaintTypes] = useState<{ _id: string; name: string }[]>([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCT, setSelectedCT] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (open && cityId) getDepartments(cityId).then(setDepartments);
  }, [open, cityId]);

  useEffect(() => {
    if (selectedDept) {
      setSelectedCT('');
      getComplaintTypes(selectedDept).then(setComplaintTypes);
    }
  }, [selectedDept]);

  const reset = () => {
    setStep(0);
    setSelectedDept('');
    setSelectedCT('');
    setDescription('');
    setLocation('');
    setIsAnonymous(false);
  };

  const handleClose = () => { setOpen(false); reset(); };

  const handleNext = () => {
    if (step === 1 && !selectedDept) { toast.error('Please select a department'); return; }
    if (step === 2 && !selectedCT) { toast.error('Please select a complaint type'); return; }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (description.length < 10) { toast.error('Description too short (min 10 characters)'); return; }
    if (!location.trim()) { toast.error('Please enter the location'); return; }
    setLoading(true);
    try {
      await submitComplaint({ cityId, departmentId: selectedDept, complaintTypeId: selectedCT, description, location, isAnonymous });
      toast.success('Complaint submitted successfully');
      onSubmitted();
      handleClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const deptName = departments.find((d) => d._id === selectedDept)?.name ?? '';
  const charCount = description.length;

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-40"
        title="File a complaint"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>File a Complaint</DialogTitle>
          </DialogHeader>

          {/* Step timeline */}
          <div className="flex items-center gap-1 mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <div className={`flex-1 h-0.5 mx-1 ${i < STEPS.length - 1 ? (i < step ? 'bg-green-400' : 'bg-gray-200') : 'hidden'}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong></p>

          {/* Step 0: City */}
          {step === 0 && (
            <div className="space-y-3">
              <Label>City</Label>
              <div className="flex items-center gap-2 px-3 py-3 rounded-lg border bg-muted text-sm">
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="font-medium">{cityName}</span>
                <span className="ml-auto text-xs text-muted-foreground">Auto-selected</span>
              </div>
              <p className="text-xs text-muted-foreground">Currently serving Mardan district only.</p>
            </div>
          )}

          {/* Step 1: Department */}
          {step === 1 && (
            <div className="space-y-3">
              <Label>Department</Label>
              <Select value={selectedDept} onValueChange={(v) => setSelectedDept(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department...">
                    {selectedDept
                      ? departments.find((d) => d._id === selectedDept)?.name
                      : <span className="text-muted-foreground">Select a department...</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Complaint Type */}
          {step === 2 && (
            <div className="space-y-3">
              <Label>Complaint Type</Label>
              <p className="text-xs text-muted-foreground">Department: <strong>{deptName}</strong></p>
              <Select value={selectedCT} onValueChange={(v) => setSelectedCT(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint type...">
                    {selectedCT
                      ? complaintTypes.find((ct) => ct._id === selectedCT)?.name
                      : <span className="text-muted-foreground">Select complaint type...</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map((ct) => (
                    <SelectItem key={ct._id} value={ct._id}>{ct.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Description</Label>
                  <span className={`text-xs ${charCount < 10 ? 'text-red-500' : charCount > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {charCount}/100
                  </span>
                </div>
                <Textarea
                  placeholder="Describe the issue clearly (10–100 characters)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Exact Location</Label>
                <Input
                  placeholder="e.g. Near Main Chowk, Gulshan Street"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between py-2.5 px-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Submit anonymously</p>
                  <p className="text-xs text-muted-foreground">Your name won't appear publicly</p>
                </div>
                <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">Back</Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1 bg-blue-700 hover:bg-blue-800">Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-700 hover:bg-blue-800">
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
