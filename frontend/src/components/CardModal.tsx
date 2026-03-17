import { useState } from 'react';
import type { Card, CheckItem } from '../services/kanban';
import { cardsService } from '../services/kanban';

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (card: Card) => void;
}

export default function CardModal({ card, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');
  const [checkItems, setCheckItems] = useState<CheckItem[]>(card.checkItems);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const done = checkItems.filter((c) => c.checked).length;
  const total = checkItems.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await cardsService.update(card.id, {
        title,
        description,
        dueDate: dueDate || null,
      });
      onUpdate({ ...updated, checkItems });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem() {
    if (!newItem.trim()) return;
    const item = await cardsService.addCheckItem(card.id, newItem.trim());
    setCheckItems([...checkItems, item]);
    setNewItem('');
  }

  async function handleToggleItem(item: CheckItem) {
    const updated = await cardsService.updateCheckItem(item.id, { checked: !item.checked });
    setCheckItems(checkItems.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleDeleteItem(id: string) {
    await cardsService.removeCheckItem(id);
    setCheckItems(checkItems.filter((i) => i.id !== id));
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full mr-4"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Adicione uma descrição..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Data de vencimento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dueDate && (
              <button
                onClick={() => setDueDate('')}
                className="ml-2 text-xs text-gray-400 hover:text-red-500"
              >
                Remover
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-600">Checklist</label>
              {total > 0 && (
                <span className="text-xs text-gray-500">{done}/{total} — {progress}%</span>
              )}
            </div>
            {total > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex flex-col gap-2 mb-2">
              {checkItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleItem(item)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className={`text-sm flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Adicionar item..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddItem}
                className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}