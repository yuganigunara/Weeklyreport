import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export function getErrorMessage(error) {
  const data = error.response?.data;
  if (data?.issues?.length) {
    return data.issues
      .map((issue) => {
        const field = issue.path ? `${issue.path}: ` : '';
        return `${field}${issue.message}`;
      })
      .join('. ');
  }

  return data?.message || 'Something went wrong';
}
