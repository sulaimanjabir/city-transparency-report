import { useState, useEffect, useCallback } from 'react';
import DeptAdminLayout from '@/components/layout/DeptAdminLayout';
import DeptCaseCard from '@/components/dept-admin/DeptCaseCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getDeptCases } from '@/api/dept-admin.api';
import { getDepartments, getComplaintTypes } from '@/api/departments.api';
import { useAuthStore } from '@/store/auth.store';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Cases' },
  { value: 'pending', label: 'Pending' },
  { value: 'verifying_in_progress', label: 'In Progress' },
  { value: 'verifying', label: 'Verifying' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'resolved', label: 'Resolved' },
];

export default function DeptAdminDashboard() {
  const { user } = useAuthStore();
  const [cases, setCases] = useState<any[]>([]);
  const [complaintTypes, setComplaintTypes] = useState<{ _id: string; name: string }[]>([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeptCases();
      setCases(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    if (user?.cityId && user?.departmentId) {
      getDepartments(user.cityId).then((depts: any[]) => {
        const dept = depts.find((d) => d._id === user.departmentId);
        if (dept) setDepartmentName(dept.name);
      });
      getComplaintTypes(user.departmentId).then(setComplaintTypes);
    }
  }, [fetchCases, user?.cityId, user?.departmentId]);

  const filtered = cases.filter((c) => {
    const statusOk = statusFilter === 'all' || c.status === statusFilter;
    const ct = typeof c.complaintTypeId === 'object' ? c.complaintTypeId : null;
    const typeOk = typeFilter === 'all' || ct?._id === typeFilter;
    return statusOk && typeOk;
  });

  const disputedCount = cases.filter((c) => c.status === 'disputed').length;
  const pendingCount = cases.filter((c) => c.status === 'pending').length;

  return (
    <DeptAdminLayout departmentName={departmentName}>
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Cases</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage and respond to complaints assigned to your department
              </p>
            </div>
            <div className="flex gap-2">
              {disputedCount > 0 && (
                <Badge className="bg-red-100 text-red-700 border border-red-200">
                  {disputedCount} Disputed
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Alert for disputed cases */}
        {disputedCount > 0 && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">
                {disputedCount} case{disputedCount > 1 ? 's' : ''} disputed by citizens
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                These are permanently visible on your record until properly resolved.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter by status">
                {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ?? 'Filter by status'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by complaint type">
                {typeFilter === 'all'
                  ? 'All Complaint Types'
                  : complaintTypes.find((ct) => ct._id === typeFilter)?.name ?? 'Filter by complaint type'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Complaint Types</SelectItem>
              {complaintTypes.map((ct) => (
                <SelectItem key={ct._id} value={ct._id}>{ct.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Cases */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="font-medium">No cases found</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all' || typeFilter !== 'all' ? 'Try clearing the filters.' : 'No complaints assigned to your department yet.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-2">
              {filtered.map((c) => (
                <DeptCaseCard key={c._id} caseData={c} onRefresh={fetchCases} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </DeptAdminLayout>
  );
}
