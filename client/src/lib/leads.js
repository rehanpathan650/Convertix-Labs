import { api } from './api.js';
// Quiz answers are saved when the visitor submits (so you can prepare for the call).
export const saveLead = (lead) => api('/leads', { method: 'POST', body: lead });
