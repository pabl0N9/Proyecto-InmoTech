<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import { Label } from '../../../../../shared/components/ui/label';
import { Input } from '../../../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { formatPhoneNumber } from '../../../../../shared/utils/phoneFormatter';

const PersonalStep = ({ formData, errors, updateFormData }) => {
  const [showPassword, setShowPassword] = React.useState(false);
=======
import React, { useState } from 'react';
import { Label } from '../../../../../shared/components/ui/label';
import { Input } from '../../../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/select';
import { formatPhoneNumber } from '../../../../../shared/utils/phoneFormatter';

const PersonalStep = ({ formData, errors, updateFormData }) => {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  const [prevPhone, setPrevPhone] = useState('');

  const handlePhoneChange = (e) => {
    const newValue = e.target.value;
    const formatted = formatPhoneNumber(newValue, prevPhone, false);
    setPrevPhone(formatted);
    updateFormData('telefono', formatted);
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const formatted = formatPhoneNumber(
        formData.telefono.slice(0, -1),
        formData.telefono,
        true
      );
      setPrevPhone(formatted);
      updateFormData('telefono', formatted);
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Información Personal</h3>
        <p className="text-slate-600 text-sm">Ingresa los datos personales del nuevo administrativo</p>
      </div>

<<<<<<< HEAD
      {/* Tipo y Número de Documento */}
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoDocumento" className="text-sm font-medium text-slate-700">
            Tipo de Documento *
          </Label>
          <Select
            value={formData.tipoDocumento}
            onValueChange={(value) => updateFormData('tipoDocumento', value)}
          >
            <SelectTrigger className={`h-10 ${errors.tipoDocumento ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipoDocumento && (
            <p className="text-sm text-red-600">{errors.tipoDocumento}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroDocumento" className="text-sm font-medium text-slate-700">
            Número de Documento *
          </Label>
          <Input
            id="numeroDocumento"
            type="text"
            value={formData.numeroDocumento}
            onChange={(e) => updateFormData('numeroDocumento', e.target.value)}
            onKeyDown={(e) => {
              const allowedKeys = [
<<<<<<< HEAD
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                " ", "-", ".", "Backspace", "Tab", "Enter",
                "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete"
=======
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                ' ', '-', '.', 'Backspace', 'Tab', 'Enter',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete'
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
              ];
              if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }}
            className={`h-10 ${errors.numeroDocumento ? 'border-red-500' : ''}`}
            placeholder="Ingresa el número"
          />
          {errors.numeroDocumento && (
            <p className="text-sm text-red-600">{errors.numeroDocumento}</p>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Nombres */}
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombreCompleto" className="text-sm font-medium text-slate-700">
            Nombre Completo *
          </Label>
          <Input
            id="nombreCompleto"
            type="text"
            value={formData.nombreCompleto}
            onChange={(e) => updateFormData('nombreCompleto', e.target.value)}
            onKeyDown={(e) => {
              const allowedKeys = [
<<<<<<< HEAD
                "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
                "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                " ", "Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight",
                "ArrowUp", "ArrowDown", "Delete"
=======
                'a','b','c','d','e','f','g','h','i','j','k','l','m',
                'n','o','p','q','r','s','t','u','v','w','x','y','z',
                'A','B','C','D','E','F','G','H','I','J','K','L','M',
                'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                ' ', 'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight',
                'ArrowUp', 'ArrowDown', 'Delete'
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
              ];
              if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }}
            className={`h-10 ${errors.nombreCompleto ? 'border-red-500' : ''}`}
            placeholder="Ingresa el nombre completo"
          />
          {errors.nombreCompleto && (
            <p className="text-sm text-red-600">{errors.nombreCompleto}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidoCompleto" className="text-sm font-medium text-slate-700">
            Apellido Completo *
          </Label>
          <Input
            id="apellidoCompleto"
            type="text"
            value={formData.apellidoCompleto}
            onChange={(e) => updateFormData('apellidoCompleto', e.target.value)}
            onKeyDown={(e) => {
              const allowedKeys = [
<<<<<<< HEAD
                "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
                "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
                "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
                "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë",
                "Ì", "Í", "Î", "Ï", "Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö",
                "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß", "à", "á", "â", "ã",
                "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï",
                "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "ø", "ù", "ú", "û", "ü",
                "ý", "þ", "ÿ", " ", "Backspace", "Tab", "Enter", "ArrowLeft",
                "ArrowRight", "ArrowUp", "ArrowDown", "Delete"
=======
                'a','b','c','d','e','f','g','h','i','j','k','l','m',
                'n','o','p','q','r','s','t','u','v','w','x','y','z',
                'A','B','C','D','E','F','G','H','I','J','K','L','M',
                'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                ' ', 'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight',
                'ArrowUp', 'ArrowDown', 'Delete'
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
              ];
              if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }}
            className={`h-10 ${errors.apellidoCompleto ? 'border-red-500' : ''}`}
            placeholder="Ingresa el apellido completo"
          />
          {errors.apellidoCompleto && (
            <p className="text-sm text-red-600">{errors.apellidoCompleto}</p>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Email y Teléfono */}
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-sm font-medium text-slate-700">
            Teléfono *
          </Label>
          <Input
            id="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            className={`h-10 ${errors.telefono ? 'border-red-500' : ''}`}
            placeholder="+57 300 000 0000"
          />
          {errors.telefono && (
            <p className="text-sm text-red-600">{errors.telefono}</p>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-slate-700">
          Contraseña *
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            className={`h-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Ingresa una contraseña segura"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
        <p className="text-xs text-slate-500">
          La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.
        </p>
=======
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Al guardar, enviaremos un correo al administrativo para que confirme su cuenta y defina su contraseña.
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      </div>
    </div>
  );
};

export default PersonalStep;
