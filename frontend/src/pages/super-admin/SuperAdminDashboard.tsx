import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCities, getDepartments } from '@/api/departments.api';
import { getDeptAdmins, createDeptAdmin } from '@/api/super-admin.api';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'departments' | 'create'>('departments');

  // State for dept admins list
  const [deptAdmins, setDeptAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // State for create form
  const [cities, setCities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', cityId: '', departmentId: '' });
  const [creating, setCreating] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    try {
      const data = await getDeptAdmins();
      setDeptAdmins(data);
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    try {
      const data = await getCities();
      setCities(data);
    } catch {
      toast.error('Failed to load cities. Is the backend running?');
    }
  }, []);

  useEffect(() => {
    void fetchAdmins();
    void fetchCities();
  }, [fetchAdmins, fetchCities]);

  const handleCityChange = (cityId: string) => {
    setForm((f) => ({ ...f, cityId, departmentId: '' }));
    getDepartments(cityId).then(setDepartments);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departmentId) { toast.error('Please select a department'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setCreating(true);
    try {
      await createDeptAdmin(form);
      toast.success(`Dept admin account created for ${form.name}`);
      setForm((f) => ({ ...f, name: '', email: '', password: '', departmentId: '' }));
      fetchAdmins();
      setActiveTab('departments');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SuperAdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 max-w-4xl mx-auto">

        {/* ── Tab: Department Admins ── */}
        {activeTab === 'departments' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Department Admins</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  All department official accounts across Mardan
                </p>
              </div>
              <Button onClick={() => setActiveTab('create')} className="bg-blue-700 hover:bg-blue-800">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Admin
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-5">
                  <p className="text-3xl font-bold text-gray-900">{deptAdmins.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Department admins created</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5">
                  <p className="text-3xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-muted-foreground mt-1">Total departments in Mardan</p>
                </CardContent>
              </Card>
            </div>

            {loadingAdmins ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : deptAdmins.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <p className="font-medium">No department admins yet</p>
                  <p className="text-sm mt-1">Click "Add Admin" to create the first one.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {deptAdmins.map((admin) => {
                  const dept = typeof admin.departmentId === 'object' ? admin.departmentId : null;
                  const city = typeof admin.cityId === 'object' ? admin.cityId : null;
                  return (
                    <Card key={admin._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-11 h-11 shrink-0">
                            <AvatarFallback className="bg-slate-700 text-white font-medium">
                              {getInitials(admin.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{admin.name}</p>
                              <Badge variant="secondary" className="text-xs">Dept. Admin</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-gray-900">{dept?.name ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{city?.name ?? 'Mardan'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Tab: Create Dept Admin ── */}
        {activeTab === 'create' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setActiveTab('departments')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create Department Admin</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Assign an official account to a department in Mardan
              </p>
            </div>

            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
                <CardDescription>
                  The official will use these credentials to log in and manage complaints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">

                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={form.cityId} onValueChange={(v) => handleCityChange(v ?? '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city">
                          {form.cityId
                            ? cities.find((c) => c._id === form.cityId)?.name
                            : <span className="text-muted-foreground">Select city</span>}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v ?? '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department">
                          {form.departmentId
                            ? departments.find((d) => d._id === form.departmentId)?.name
                            : <span className="text-muted-foreground">Select department</span>}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Mr. Tariq Ahmed"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tariq@mardan.gov.pk"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Share these credentials securely with the official.
                    </p>
                  </div>

                  <Button type="submit" disabled={creating} className="w-full bg-blue-700 hover:bg-blue-800 mt-2">
                    {creating ? 'Creating account...' : 'Create Department Admin'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
