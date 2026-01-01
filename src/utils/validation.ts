/**
 * Validation Utilities
 * Funciones reutilizables para validación de formularios
 */

// Tipo para funciones de validación
export type Validator = (value: any) => string | undefined;

/**
 * Validadores básicos
 */
export const validators = {
  /**
   * Valida que el campo no esté vacío
   */
  required: (value: any): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return 'Este campo es requerido';
    }
    if (typeof value === 'string' && value.trim() === '') {
      return 'Este campo es requerido';
    }
    return undefined;
  },

  /**
   * Valida formato de email
   */
  email: (value: string): string | undefined => {
    if (!value) return undefined; // Solo valida si hay valor
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : 'Email inválido';
  },

  /**
   * Valida longitud mínima
   */
  minLength: (length: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    return value.length >= length ? undefined : `Mínimo ${length} caracteres`;
  },

  /**
   * Valida longitud máxima
   */
  maxLength: (length: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    return value.length <= length ? undefined : `Máximo ${length} caracteres`;
  },

  /**
   * Valida contraseña (mínimo 6 caracteres)
   */
  password: (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return undefined;
  },

  /**
   * Valida que dos campos coincidan (para confirmar contraseña)
   */
  matchPassword: (password: string) => (confirmPassword: string): string | undefined => {
    if (!confirmPassword) return undefined;
    return password === confirmPassword ? undefined : 'Las contraseñas no coinciden';
  },

  /**
   * Valida formato de número de unidad (ej: 101, 2A, 305)
   */
  unitNumber: (value: string): string | undefined => {
    if (!value) return undefined;
    const unitRegex = /^[0-9]{1,4}[A-Z]?$/;
    return unitRegex.test(value) ? undefined : 'Formato inválido (ej: 101, 2A)';
  },

  /**
   * Valida número de teléfono
   */
  phone: (value: string): string | undefined => {
    if (!value) return undefined;
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(value) ? undefined : 'Teléfono inválido';
  },

  /**
   * Valida que sea un número
   */
  numeric: (value: any): string | undefined => {
    if (value === '' || value === null || value === undefined) return undefined;
    return !isNaN(Number(value)) ? undefined : 'Debe ser un número';
  },

  /**
   * Valida rango numérico
   */
  range: (min: number, max: number) => (value: any): string | undefined => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    if (isNaN(num)) return 'Debe ser un número';
    if (num < min || num > max) return `Debe estar entre ${min} y ${max}`;
    return undefined;
  },
};

/**
 * Combina múltiples validadores en uno solo
 * Se ejecutan en orden y retorna el primer error encontrado
 */
export const composeValidators = (...validators: Validator[]): Validator => {
  return (value: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
};

/**
 * Validador personalizado basado en una función
 */
export const custom = (
  fn: (value: any) => boolean,
  message: string
): Validator => {
  return (value: any): string | undefined => {
    return fn(value) ? undefined : message;
  };
};
