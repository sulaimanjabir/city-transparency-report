import api from './axios';

export const getDeptAdmins = () =>
  api.get('/users/dept-admins').then((r) => r.data);

export const createDeptAdmin = (data: {
  name: string;
  email: string;
  password: string;
  cityId: string;
  departmentId: string;
}) => api.post('/auth/create-dept-admin', data).then((r) => r.data);
