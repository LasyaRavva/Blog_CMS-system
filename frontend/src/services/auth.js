import api from './api';

export async function signupApi({ username, email, password }) {
  const { data } = await api.post('/auth/signup', { username, email, password });
  return data; // { user, token }
}

export async function loginApi({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { user, token }
}

export async function getMeApi() {
  const { data } = await api.get('/auth/me');
  return data.user;
}
