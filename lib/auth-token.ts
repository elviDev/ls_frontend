import { apiClient } from './api-client';

export function getAuthToken(): string | null {
  return apiClient.getToken();
}