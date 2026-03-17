import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { boardsService } from '../services/boards';
import { columnsService, cardsService } from '../services/kanban';
import type { Column, Card, BoardDetail } from '../services/kanban';
import { useAuth } from '../contexts/AuthContext';
import CardModal from '../components/CardModal';

function CardItem({ card, onDelete, onClick }: { card: Card; onDelete: (id: string) => void; onClick: (card: Card) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, data: { type: 'card', card } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const done = card.checkItems.filter((c) => c.checked).length;
  const total = card.checkItems.length;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={() => onClick(card)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing group">
      <p className="text-sm text-gray-800 mb-2">{card.title}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {card.dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {new Date(card.dueDate).toLocaleDateString('pt-BR')}
          </span>
        )}
        {total > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${done === total ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            ✓ {done}/{total}
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
          className="ml-auto text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
          ✕
        </button>
      </div>
    </div>
  );
}

function ColumnItem({ column, onAddCard, onDeleteCard, onDeleteColumn, onClickCard, search }: {
  column: Column;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onDeleteColumn: (id: string) => void;
  onClickCard: (card: Card) => void;
  search: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id, data: { type: 'column' } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [newCard, setNewCard] = useState('');
  const [showInput, setShowInput] = useState(false);

  const filtered = column.cards.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd() {
    if (!newCard.trim()) return;
    await onAddCard(column.id, newCard.trim());
    setNewCard('');
    setShowInput(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-64 bg-gray-100 rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1" {...attributes} {...listeners}>
        <h3 className="font-medium text-sm text-gray-700 cursor-grab">{column.title}</h3>
        <button onClick={() => onDeleteColumn(column.id)} className="text-gray-300 hover:text-red-400 text-xs transition">✕</button>
      </div>

      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[4px]">
          {filtered.map((card) => (
            <CardItem key={card.id} card={card} onDelete={onDeleteCard} onClick={onClickCard} />
          ))}
        </div>
      </SortableContext>

      {showInput ? (
        <div className="flex flex-col gap-2 mt-1">
          <input autoFocus type="text" value={newCard} onChange={(e) => setNewCard(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Título do cartão"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition">Adicionar</button>
            <button onClick={() => { setShowInput(false); setNewCard(''); }} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowInput(true)} className="text-sm text-gray-500 hover:text-gray-700 text-left mt-1 hover:bg-gray-200 rounded-lg px-2 py-1 transition">
          + Adicionar cartão
        </button>
      )}
    </div>
  );
}

export default function Board() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [newColTitle, setNewColTitle] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [search, setSearch] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { loadBoard(); }, [id]);

  async function loadBoard() {
    if (!id) return;
    try {
      const data = await boardsService.findOne(id);
      setBoard(data);
      setColumns(data.columns);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddColumn() {
    if (!newColTitle.trim() || !id) return;
    const col = await columnsService.create(id, newColTitle.trim());
    setColumns([...columns, { ...col, cards: [] }]);
    setNewColTitle('');
    setShowColInput(false);
  }

  async function handleDeleteColumn(colId: string) {
    if (!confirm('Excluir esta coluna e todos os cartões?')) return;
    await columnsService.remove(colId);
    setColumns(columns.filter((c) => c.id !== colId));
  }

  async function handleAddCard(columnId: string, title: string) {
    const card = await cardsService.create(columnId, title);
    setColumns(columns.map((c) => c.id === columnId ? { ...c, cards: [...c.cards, card] } : c));
  }

  async function handleDeleteCard(cardId: string) {
    await cardsService.remove(cardId);
    setColumns(columns.map((c) => ({ ...c, cards: c.cards.filter((card) => card.id !== cardId) })));
  }

  function handleUpdateCard(updated: Card) {
    setColumns(columns.map((c) => ({
      ...c,
      cards: c.cards.map((card) => card.id === updated.id ? updated : card),
    })));
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'card') {
      setActiveCard(event.active.data.current.card);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeCol = columns.find((c) => c.cards.some((card) => card.id === activeId));
    const overCol = columns.find((c) => c.id === overId || c.cards.some((card) => card.id === overId));
    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setColumns((cols) => {
      const activeCard = activeCol.cards.find((c) => c.id === activeId)!;
      return cols.map((c) => {
        if (c.id === activeCol.id) return { ...c, cards: c.cards.filter((card) => card.id !== activeId) };
        if (c.id === overCol.id) return { ...c, cards: [...c.cards, { ...activeCard, columnId: overCol.id }] };
        return c;
      });
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    if (active.data.current?.type === 'column') {
      const oldIndex = columns.findIndex((c) => c.id === activeId);
      const newIndex = columns.findIndex((c) => c.id === overId);
      const reordered = arrayMove(columns, oldIndex, newIndex);
      setColumns(reordered);
      await columnsService.reorder(id!, reordered.map((c) => c.id));
      return;
    }

    const col = columns.find((c) => c.cards.some((card) => card.id === activeId));
    if (!col) return;
    const oldIndex = col.cards.findIndex((c) => c.id === activeId);
    const newIndex = col.cards.findIndex((c) => c.id === overId);
    if (oldIndex !== newIndex) {
      const reordered = arrayMove(col.cards, oldIndex, newIndex);
      setColumns(columns.map((c) => c.id === col.id ? { ...c, cards: reordered } : c));
      await cardsService.move(activeId, col.id, newIndex);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col">
      <header className="px-6 py-3 flex items-center justify-between bg-blue-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/boards')} className="text-blue-200 hover:text-white text-sm transition">← Voltar</button>
          <h1 className="text-white font-semibold">{board?.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cartões..."
            className="bg-blue-600 border border-blue-400 text-white placeholder-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white w-48"
          />
          <span className="text-blue-200 text-sm">{user?.name}</span>
          <button onClick={logout} className="text-sm text-blue-200 hover:text-white transition">Sair</button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 items-start">
              {columns.map((col) => (
                <ColumnItem key={col.id} column={col} onAddCard={handleAddCard} onDeleteCard={handleDeleteCard}
                  onDeleteColumn={handleDeleteColumn} onClickCard={setSelectedCard} search={search} />
              ))}
              <div className="flex-shrink-0 w-64">
                {showColInput ? (
                  <div className="bg-gray-100 rounded-xl p-3 flex flex-col gap-2">
                    <input autoFocus type="text" value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                      placeholder="Nome da coluna"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="flex gap-2">
                      <button onClick={handleAddColumn} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition">Criar</button>
                      <button onClick={() => { setShowColInput(false); setNewColTitle(''); }} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowColInput(true)}
                    className="w-full bg-blue-500 bg-opacity-50 hover:bg-opacity-70 text-white rounded-xl px-4 py-3 text-sm text-left transition">
                    + Adicionar coluna
                  </button>
                )}
              </div>
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCard && (
              <div className="bg-white rounded-lg p-3 shadow-lg border border-blue-300 w-64">
                <p className="text-sm text-gray-800">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
        />
      )}
    </div>
  );
}