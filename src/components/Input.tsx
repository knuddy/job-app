import { ComponentPropsWithoutRef } from 'react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  id: string;
  invalidFeedback?: string;
}

export function Input(
  {
    label,
    id,
    invalidFeedback,
    className = "",
    ...props
  }: InputProps
) {
  return (
    <div className="mb-3 has-validation">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        className={`form-control ${className}`}
        name={id}
        id={id}
        type="text"
        required
        {...props}
      />
      {invalidFeedback && <div className="invalid-feedback">
        {invalidFeedback}
      </div>}
    </div>
  );
}

type NumberInputProps = Omit<InputProps, 'type' | 'step'>;

export function NumberInput(props: NumberInputProps) {
  return (
    <Input type="number" step="any" {...props} />
  );
}