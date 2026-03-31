import { useId } from "react";

/**
 * Input Component - Reusable input field with label and validation
 */
function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label} {required && <span className="input-group__required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input ${error ? "input--error" : ""}`}
        {...props}
      />
      {error && <p className="input-group__error">{error}</p>}
    </div>
  );
}

export default Input;
