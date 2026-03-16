import api from './api';

export interface Board {
  id: string;
  title: string;
  createdAt: string;
}

export const boardsService = {
  findAll: async (): Promise<Board[]> => {
    const { data } = await api.get('/boards');
    return data;
  },

  findOne: async (id: string) => {
    const { data } = await api.get(`/boards/${id}`);
    return data;
  },

  create: async (title: string): Promise<Board> => {
    const { data } = await api.post('/boards', { title });
    return data;
  },

  update: async (id: string, title: string): Promise<Board> => {
    const { data } = await api.patch(`/boards/${id}`, { title });
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};