import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";

export default function ProtectedRoute() {
  const { mode, setMode } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "kassa") {
      setMode("real");
      setError(false);
    } else if (password === "password") {
      setMode("fiction");
      setError(false);
    } else {
      setError(true);
    }
  };

  if (mode === "real" || mode === "fiction") {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-gray-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Доступ закрыт</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Пожалуйста, введите пароль для доступа к этому разделу.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              className={`w-full bg-[#f0f2f1] rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-shadow ${
                error ? "border border-red-300 focus:ring-red-300" : ""
              }`}
              placeholder="Пароль..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mt-1.5 ml-1">
                Неверный пароль.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gray-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
