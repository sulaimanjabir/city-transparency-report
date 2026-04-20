import api from './axios';

export const getCityFeed = (cityId: string) =>
  api.get(`/cases/feed/${cityId}`).then((r) => r.data);

export const getMyCases = () =>
  api.get('/cases/my').then((r) => r.data);

export const submitComplaint = (data: {
  cityId: string;
  departmentId: string;
  complaintTypeId: string;
  description: string;
  location: string;
  isAnonymous: boolean;
}) => api.post('/cases', data).then((r) => r.data);

export const joinCase = (caseId: string, data: {
  description: string;
  location: string;
  isAnonymous: boolean;
}) => api.post(`/cases/${caseId}/join`, data).then((r) => r.data);

export const castVote = (caseId: string, value: 'resolved' | 'not_resolved') =>
  api.post(`/votes/${caseId}`, { value }).then((r) => r.data);

export const getVoteStatus = (caseId: string) =>
  api.get(`/votes/${caseId}/status`).then((r) => r.data);
