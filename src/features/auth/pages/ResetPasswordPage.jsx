import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!token) {
      setStatus({ type: 'error', message: 'El enlace de recuperación no es válido o ya expiró.' });
      return false;
    }
    if (form.password.length < 8) {
      setStatus({ type: 'error', message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Las contraseñas no coinciden.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      setStatus({ type: '', message: '' });
      await resetPassword(token, form.password);
      setStatus({
        type: 'success',
        message: 'Contraseña actualizada. Te redirigiremos al inicio de sesión.'
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'No se pudo restablecer la contraseña.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Restablecer contraseña</h1>
          <p className="text-sm text-slate-500">
            Ingresa una nueva contraseña para continuar. Procura que sea segura y fácil de recordar.
          </p>
        </div>

        {status.message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {status.message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-600">Nueva contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Ingresa una contraseña segura"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Confirma la contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Repite la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Actualizando...' : 'Guardar nueva contraseña'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
