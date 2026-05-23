import api from './api';

export async function getPostsApi({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/posts', { params: { page, limit } });
  return data; // { posts, total, page, totalPages }
}

export async function getPostApi(slug) {
  const { data } = await api.get(`/posts/${slug}`);
  return data;
}

export async function createPostApi({ title, body, status }) {
  const { data } = await api.post('/posts', { title, body, status });
  return data;
}

export async function updatePostApi(id, fields) {
  const { data } = await api.put(`/posts/${id}`, fields);
  return data;
}

export async function deletePostApi(id) {
  await api.delete(`/posts/${id}`);
}

export async function getMyPostsApi() {
  const { data } = await api.get('/posts/me');
  return data;
}

export async function createCommentApi({ body, postId }) {
  const { data } = await api.post('/comments', { body, postId });
  return data;
}

export async function deleteCommentApi(id) {
  await api.delete(`/comments/${id}`);
}
