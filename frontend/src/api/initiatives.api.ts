import api from './axios';

export const getCityInitiatives = (cityId: string) =>
  api.get(`/initiatives/city?cityId=${cityId}`).then((r) => r.data);

export const getDeptInitiatives = () =>
  api.get('/initiatives/department').then((r) => r.data);

export const createInitiative = (data: {
  title: string;
  description: string;
  targetAmount: number;
}) => api.post('/initiatives', data).then((r) => r.data);

export const donateToInitiative = (initiativeId: string, amount: number) =>
  api.post(`/initiatives/${initiativeId}/donate`, { amount }).then((r) => r.data);

export const postInitiativeProof = (initiativeId: string, data: {
  proofUrl: string;
  expenseBreakdown: string;
}) => api.put(`/initiatives/${initiativeId}/proof`, data).then((r) => r.data);

export const voteSatisfaction = (initiativeId: string, value: 'satisfied' | 'not_satisfied') =>
  api.post(`/initiatives/${initiativeId}/satisfaction`, { value }).then((r) => r.data);

export const getSatisfactionStatus = (initiativeId: string) =>
  api.get(`/initiatives/${initiativeId}/satisfaction-status`).then((r) => r.data);

export const getDonationStatus = (initiativeId: string) =>
  api.get(`/initiatives/${initiativeId}/donation-status`).then((r) => r.data);
