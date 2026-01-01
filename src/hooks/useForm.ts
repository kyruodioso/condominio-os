import { useState, FormEvent } from 'react';

export interface UseFormConfig<T extends Record<string, any>> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (name: keyof T) => (value: any) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  resetForm: () => void;
}

/**
 * Custom hook para manejar estado y validación de formularios
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormConfig<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja cambio de valor de un campo
   */
  const handleChange = (name: keyof T) => (value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Maneja blur de un campo (cuando pierde el foco)
   */
  const handleBlur = (name: keyof T) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Valida el campo si hay función de validación
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  /**
   * Maneja submit del formulario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Marca todos los campos como touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof T, boolean>>
    );
    setTouched(allTouched);
    
    // Valida todo el formulario
    if (validate) {
      const fieldErrors = validate(values);
      setErrors(fieldErrors);
      
      // Si hay errores, no enviar
      if (Object.keys(fieldErrors).length > 0) {
        return;
      }
    }
    
    // Enviar formulario
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Establece valor de un campo manualmente
   */
  const setFieldValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Establece error de un campo manualmente
   */
  const setFieldError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Establece touched de un campo manualmente
   */
  const setFieldTouched = (name: keyof T, touchedValue: boolean) => {
    setTouched(prev => ({ ...prev, [name]: touchedValue }));
  };

  /**
   * Resetea el formulario a valores iniciales
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
  };
}
