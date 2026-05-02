import { IonInput } from '@ionic/react';
import { ComponentPropsWithoutRef } from 'react';

interface InputProps extends Omit<ComponentPropsWithoutRef<typeof IonInput>, 'enterKeyHint'> {
  label: string;
  name: string;
  className?: string;
  showValidation?: boolean;
  invalidFeedback?: string;
  last?: boolean;
}

export function Input({ label, name, className = '', showValidation, invalidFeedback, last, required = true, ...props }: InputProps) {
  return (
    <IonInput
      type="text"
      label={label}
      labelPlacement="stacked"
      name={name}
      fill="outline"
      className={`${showValidation ? 'ion-invalid ion-touched' : ''} ${className}`}
      errorText={invalidFeedback}
      required={required}
      enterKeyHint={last ? 'done' : 'next'}
      {...props}
    />
  );
}

type NumberInputProps = Omit<InputProps, 'type' | 'step'>;

export function NumberInput({ ...props }: NumberInputProps) {
  return <Input type="number" step="any"{...props}/>;
}