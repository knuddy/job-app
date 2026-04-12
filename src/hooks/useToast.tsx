import { useIonToast } from '@ionic/react';
import * as icons from 'ionicons/icons';
import { useMemo } from 'react';

export function useToast() {
  const [present] = useIonToast();
  return useMemo(() => ({
    Toast: {
      success: (message: string) => {
        void present({
          message,
          duration: 2000,
          color: 'success',
          icon: icons.checkmarkCircleOutline,
          buttons: [{ icon: icons.closeOutline, role: 'cancel' }],
        });
      },
      error: (message: string) => {
        void present({
          message,
          color: 'danger',
          icon: icons.warning,
          buttons: [{ icon: icons.closeOutline, role: 'cancel' }],
        });
      }
    }
  }), [present]);
}