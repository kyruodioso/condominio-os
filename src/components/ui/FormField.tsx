import { useState, useEffect } from 'react';
import { LucideIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'select';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  icon?: LucideIcon;
  hint?: string;
  validate?: (value: any) => string | undefined;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showSuccess?: boolean;
  children?: React.ReactNode; // For select options
  endAdornment?: React.ReactNode; // For custom right-side content (e.g. password toggle)
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error: externalError,
  touched = false,
  required = false,
  placeholder,
  disabled = false,
  autoComplete,
  icon: Icon,
  hint,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  showSuccess = false,
  children,
  endAdornment,
}: FormFieldProps) {
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isTouched, setIsTouched] = useState(touched);
  const [isFocused, setIsFocused] = useState(false);

  // Use external error if provided, otherwise use internal
  const displayError = externalError || internalError;
  const shouldShowError = (touched || isTouched) && displayError;
  const isValid = (touched || isTouched) && !displayError && value && showSuccess;

  useEffect(() => {
    setIsTouched(touched);
  }, [touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate on change if enabled
    if (validateOnChange && validate) {
      const error = validate(newValue);
      setInternalError(error);
    } else if (internalError) {
      // Clear error on change
      setInternalError(undefined);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
    setIsFocused(false);

    // Validate on blur if enabled
    if (validateOnBlur && validate) {
      const error = validate(value);
      setInternalError(error);
    }

    // Call external onBlur if provided
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const inputId = `field-${name}`;
  const errorId = `error-${name}`;
  const hintId = `hint-${name}`;

  return (
    <div className="w-full">
      {/* Label */}
      <label
        htmlFor={inputId}
        className={clsx(
          'block text-sm font-bold mb-2 transition-colors',
          shouldShowError ? 'text-red-400' : isFocused ? 'text-gym-primary' : isValid ? 'text-green-400' : 'text-gray-300'
        )}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon
              size={20}
              className={clsx(
                'transition-colors',
                shouldShowError ? 'text-red-400' : isFocused ? 'text-gym-primary' : 'text-gray-500'
              )}
            />
          </div>
        )}

        {/* Input or Select */}
        {type === 'select' ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={disabled}
            aria-invalid={shouldShowError ? 'true' : 'false'}
            aria-describedby={shouldShowError ? errorId : hint ? hintId : undefined}
            className={clsx(
              'w-full rounded-xl px-4 py-3 bg-gym-gray text-white text-sm transition-all',
              'focus:outline-none focus:ring-2',
              Icon && 'pl-12',
              (isValid || endAdornment) && 'pr-12',
              shouldShowError
                ? 'border-2 border-red-500 focus:ring-red-500/50'
                : isFocused
                  ? 'border-2 border-gym-primary focus:ring-gym-primary/50'
                  : isValid
                    ? 'border-2 border-green-500 focus:ring-green-500/50'
                    : 'border-2 border-white/10 focus:ring-gym-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {children}
          </select>
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-invalid={shouldShowError ? 'true' : 'false'}
            aria-describedby={shouldShowError ? errorId : hint ? hintId : undefined}
            className={clsx(
              'w-full rounded-xl px-4 py-3 bg-gym-gray text-white text-sm transition-all',
              'placeholder-gray-500 focus:outline-none focus:ring-2',
              Icon && 'pl-12',
              (isValid || endAdornment) && 'pr-12',
              shouldShowError
                ? 'border-2 border-red-500 focus:ring-red-500/50'
                : isFocused
                  ? 'border-2 border-gym-primary focus:ring-gym-primary/50'
                  : isValid
                    ? 'border-2 border-green-500 focus:ring-green-500/50'
                    : 'border-2 border-white/10 focus:ring-gym-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )}

        {/* Success Icon */}
        {isValid && !endAdornment && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 size={20} className="text-green-400" />
          </div>
        )}

        {/* Custom API End Adornment */}
        {endAdornment && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>

      {/* Error Message */}
      {shouldShowError && (
        <div
          id={errorId}
          className="flex items-start gap-2 mt-2 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Hint Text */}
      {hint && !shouldShowError && (
        <p id={hintId} className="mt-2 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
