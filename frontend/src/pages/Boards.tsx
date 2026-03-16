import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Board } from '../services/boards';
import { boardsService } from '../services/boards';

export default function Boards() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    try {
      const data = await boardsService.findAll();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const board = await boardsService.create(newTitle.trim());
      setBoards([board, ...boards]);
      setNewTitle('');
      setShowInput(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editingTitle.trim()) return;
    const updated = await boardsService.update(id, editingTitle.trim());
    setBoards(boards.map((b) => (b.id === id ? updated : b)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja excluir este quadro?')) return;
    await boardsService.remove(id);
    setBoards(boards.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Kanban App</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Olá, {user?.name}</span>
          <button onClick={logout} className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-lg transition">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Meus quadros</h2>
          <button
            onClick={() => setShowInput(true)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Novo quadro
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {showInput && (
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border border-blue-300">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nome do quadro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {creating ? 'Criando...' : 'Criar'}
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setNewTitle(''); }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                {editingId === board.id ? (
                  <div
                    className="flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(board.id)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(board.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-800">{board.title}</h3>
                    <div
                      className="flex gap-3 mt-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setEditingId(board.id); setEditingTitle(board.title); }}
                        className="text-xs text-gray-400 hover:text-blue-600 transition"
                      >
                        Renomear
                      </button>
                      <button
                        onClick={() => handleDelete(board.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {boards.length === 0 && !showInput && (
              <p className="text-gray-400 text-sm col-span-4">Nenhum quadro criado ainda.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}