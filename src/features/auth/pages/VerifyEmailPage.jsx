import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Mail, RotateCcw } from 'lucide-react';
import invitacionApi from '../../../shared/services/invitacionApiService';
import { useAuth } from '../../../shared/contexts/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [estado, setEstado] = useState('loading'); // loading | success | error | blocked
  const [mensaje, setMensaje] = useState('');
  const [correoInvitacion, setCorreoInvitacion] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionBlocked, setSessionBlocked] = useState(false);

  const verificar = async () => {
    if (!token) {
      setEstado('error');
      setMensaje('Token de verificación no encontrado.');
      setCanResend(false);
      return;
    }
    try {
      const res = await invitacionApi.validar(token);
      if (res?.success) {
        const correo = (res.data?.correo || '').toLowerCase();
        setCorreoInvitacion(correo);
        const currentEmail = (user?.correo || '').toLowerCase();
        const mismatch = isAuthenticated && correo && currentEmail && correo !== currentEmail;
        setSessionBlocked(mismatch);
        if (mismatch) {
          setEstado('blocked');
          return;
        }
        setEstado('success');
        setMensaje('Correo confirmado. Redirigiendo...');
        setTimeout(() => navigate('/'), 1200);
      } else {
        setEstado('error');
        setMensaje(res?.message || 'No se pudo verificar el correo.');
        setCanResend(true);
      }
    } catch (error) {
      setEstado('error');
      setMensaje(error?.data?.message || error.message || 'No se pudo verificar el correo.');
      setCanResend(true);
    }
  };

  const handleResend = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setMensaje('');
    try {
      const res = await invitacionApi.reenviar(token);
      if (res?.success) {
        setEstado('success');
        setMensaje('Hemos reenviado el enlace a tu correo. Revisa tu bandeja.');
        setCanResend(false);
      } else {
        setEstado('error');
        setMensaje(res?.message || 'No se pudo reenviar el enlace.');
        setCanResend(true);
      }
    } catch (err) {
      setEstado('error');
      setMensaje(err?.data?.message || err.message || 'No se pudo reenviar el enlace.');
      setCanResend(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAndReload = async () => {
    try {
      setIsSubmitting(true);
      await logout();
      window.location.reload();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    verificar();
  }, [token, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-[#00457B] to-[#0066CC] text-white p-8">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6" />
            <div>
              <p className="text-sm text-blue-100">Verificación de correo</p>
              <h1 className="text-2xl font-semibold">Confirma tu email</h1>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {estado === 'loading' && (
            <div className="flex items-center gap-3 text-slate-600">
              <div className="h-5 w-5 border-2 border-slate-200 border-t-[#00457B] rounded-full animate-spin" />
              <span>Validando tu enlace...</span>
            </div>
          )}

          {estado === 'blocked' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-semibold">Para verificar esta cuenta debes cerrar la sesión actual.</p>
              <p className="text-amber-700 text-sm mb-3">Correo del enlace: {correoInvitacion}</p>
              <button
                onClick={handleLogoutAndReload}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00457B] text-white font-medium hover:bg-[#003b69] disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Cerrar sesión y continuar
              </button>
            </div>
          )}

          {estado === 'error' && !sessionBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-700 font-semibold">No se pudo verificar</p>
                <p className="text-red-600 text-sm">{mensaje}</p>
                {canResend && (
                  <button
                    onClick={handleResend}
                    disabled={isSubmitting}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#00457B] hover:bg-blue-50 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reenviar enlace
                  </button>
                )}
              </div>
            </div>
          )}

          {estado === 'success' && !sessionBlocked && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-700 font-semibold">¡Listo!</p>
                <p className="text-green-600 text-sm">{mensaje}</p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Si cerraste esta pestaña, vuelve a abrir el enlace del correo. Si no encuentras el correo, revisa spam o solicita un reenvío.
          </p>
        </div>
      </div>
    </div>
  );
}
