import { IonTextarea } from '@ionic/react';
import { ComponentPropsWithoutRef } from 'react';

interface TextAreaProps extends Omit<ComponentPropsWithoutRef<typeof IonTextarea>, 'enterKeyHint'> {
  label: string;
  name: string;
  className?: string;
  showValidation?: boolean;
  invalidFeedback?: string;
  last?: boolean;
}

export function TextArea({ label, name, className = '', showValidation, invalidFeedback, last, required = true, ...props }: TextAreaProps) {
  const autoGrow = props.autoGrow ?? true;
  const rows = props.rows ?? 5;

  return (
    <IonTextarea
      label={label}
      labelPlacement="stacked"
      name={name}
      fill="outline"
      className={`${showValidation ? 'ion-invalid ion-touched' : ''} ${className}`}
      errorText={invalidFeedback}
      required={required}
      autoGrow={autoGrow}
      rows={rows}
      {...props}
    />
  );
}