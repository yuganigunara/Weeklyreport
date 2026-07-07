import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong';
}
