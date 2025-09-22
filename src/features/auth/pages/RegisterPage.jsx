import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  Trophy,
  Shield,
} from "lucide-react";

// Nota: Necesitarás crear o adaptar estos componentes de UI para tu proyecto
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Checkbox } from "../../../shared/components/ui/checkbox";

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "password") {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "Débil";
    if (score <= 3) return "Regular";
    if (score <= 4) return "Buena";
    return "Excelente";
  };

  return (
    <div className="flex flex-1 ">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00457B] via-[#0056A3] to-[#0066CC] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white mx-auto">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight">
                Únete a la
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Revolución Inmobiliaria
                </span>
              </h1>
              <p className="text-lg text-blue-100">Más de 10,000 profesionales confían en nosotros</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Herramientas Premium</h3>
                  <p className="text-blue-100 text-sm">Acceso a todas las funciones</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Soporte 24/7</h3>
                  <p className="text-blue-100 text-sm">Asistencia cuando la necesites</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">100% Seguro</h3>
                  <p className="text-blue-100 text-sm">Datos protegidos y encriptados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-orange-300/20 rounded-full blur-lg"></div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md space-y-8 min-h-[830px] flex flex-col justify-center">
          {/* Logo móvil */}
          <div className="lg:hidden text-center">
            <img src="/images/logo-matriz-sin-fondo-negro.png" alt="Matriz Inmobiliaria" width={160} height={50} className="mx-auto" />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Crea tu cuenta</h2>
            <p className="text-gray-600">Comienza tu viaje inmobiliario hoy mismo</p>
          </div>

          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700 font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-[#00457B]" />
                  Nombre completo
                </Label>
                <div className="relative">
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Tu nombre completo"
                    className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#00457B]" />
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-gray-700 font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#00457B]" />
                  Teléfono
                </Label>
                <div className="relative">
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="Tu número de teléfono"
                    className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                  />
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Fortaleza de contraseña:</span>
                    <span
                      className={`text-sm font-semibold ${
                        getPasswordStrengthScore() <= 2
                          ? "text-red-600"
                          : getPasswordStrengthScore() <= 3
                            ? "text-yellow-600"
                            : getPasswordStrengthScore() <= 4
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      {passwordStrength.length ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">8+ caracteres</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.uppercase ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Mayúscula</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.number ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Número</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.special ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Símbolo</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <div className="flex items-center mt-2 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Las contraseñas no coinciden</span>
                    </div>
                  )}
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="flex items-center mt-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Las contraseñas coinciden</span>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <Checkbox
                id="terminos"
                name="terminos"
                checked={formData.terminos}
                onCheckedChange={(checked) => setFormData({ ...formData, terminos: checked })}
                className="h-5 w-5 mt-0.5 border-2 border-[#00457B] text-[#00457B] rounded-md"
                required
              />
              <Label htmlFor="terminos" className="text-gray-700 font-medium text-sm leading-relaxed">
                Acepto los{" "}
                <a href="/terminos" className="text-[#00457B] hover:text-[#003b69] font-semibold underline">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="/privacidad" className="text-[#00457B] hover:text-[#003b69] font-semibold underline">
                  política de privacidad
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#00457B] to-[#0056A3] hover:from-[#003b69] hover:to-[#004a8f] rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
              disabled={isLoading || !formData.terminos || formData.password !== formData.confirmPassword}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center justify-center text-white">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">     </span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-[#00457B] font-semibold hover:text-[#003b69] transition-colors">
                Inicia sesión
              </a>
            </p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Matriz Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
