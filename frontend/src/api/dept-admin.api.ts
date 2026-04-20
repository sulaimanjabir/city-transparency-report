import api from './axios';

export const getDeptCases = () =>
  api.get('/cases/department').then((r) => r.data);

export const markInProgress = (caseId: string) =>
  api.put(`/cases/${caseId}/in-progress`).then((r) => r.data);

export const markSolved = (caseId: string, solvedPhotoUrl: string) =>
  api.put(`/cases/${caseId}/solve`, { solvedPhotoUrl }).then((r) => r.data);
