import api from './axios';

export const getCities = () =>
  api.get('/cities').then((r) => r.data);

export const getDepartments = (cityId: string) =>
  api.get(`/departments?cityId=${cityId}`).then((r) => r.data);

export const getComplaintTypes = (departmentId: string) =>
  api.get(`/complaint-types?departmentId=${departmentId}`).then((r) => r.data);
