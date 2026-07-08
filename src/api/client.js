import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export function getErrorMessage(error) {
  const data = error.response?.data;
  if (data?.issues?.length) {
    const detail = data.issues
      .map((issue) => {
        const field = issue.path ? `${issue.path}: ` : '';
        return `${field}${issue.message}`;
      })
      .join(' | ');
    return detail;
  }

  return data?.message || 'Something went wrong';
}
