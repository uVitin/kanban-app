import { useAuth } from '../contexts/AuthContext';

export default function Boards() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Meus quadros</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:underline"
            >
              Sair
            </button>
          </div>
        </div>
        <p className="text-gray-500">Em breve seus quadros aparecerão aqui.</p>
      </div>
    </div>
  );
}