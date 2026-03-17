import api from './api';

export interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
  position: number;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  position: number;
  columnId: string;
  checkItems: CheckItem[];
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface BoardDetail {
  id: string;
  title: string;
  columns: Column[];
}

export const columnsService = {
  create: async (boardId: string, title: string): Promise<Column> => {
    const { data } = await api.post('/columns', { boardId, title });
    return data;
  },
  update: async (id: string, title: string): Promise<Column> => {
    const { data } = await api.patch(`/columns/${id}`, { title });
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/columns/${id}`);
  },
  reorder: async (boardId: string, columnIds: string[]): Promise<void> => {
    await api.patch(`/columns/reorder/${boardId}`, { columnIds });
  },
};

export const cardsService = {
  create: async (columnId: string, title: string): Promise<Card> => {
    const { data } = await api.post('/cards', { columnId, title });
    return data;
  },
  update: async (id: string, payload: { title?: string; description?: string; dueDate?: string | null }): Promise<Card> => {
    const { data } = await api.patch(`/cards/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },
  move: async (id: string, columnId: string, position: number): Promise<Card> => {
    const { data } = await api.patch(`/cards/${id}/move`, { columnId, position });
    return data;
  },
  addCheckItem: async (cardId: string, text: string): Promise<CheckItem> => {
    const { data } = await api.post(`/cards/${cardId}/checklist`, { text });
    return data;
  },
  updateCheckItem: async (id: string, payload: { text?: string; checked?: boolean }): Promise<CheckItem> => {
    const { data } = await api.patch(`/cards/checklist/${id}`, payload);
    return data;
  },
  removeCheckItem: async (id: string): Promise<void> => {
    await api.delete(`/cards/checklist/${id}`);
  },
};