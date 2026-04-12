import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NumberInput } from "@src/components/Input.tsx";
import * as icons from 'ionicons/icons';
import { IonButton, IonIcon, IonList } from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@src/hooks/useToast.tsx';
import { getPanel, updatePanel } from '@src/db/queries/panel.ts';

const panelSchema = z.object({
  width: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  height: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  center: z.coerce.number().min(0, "Must be greater than or equal to 0"),
});

type PanelFormData = z.infer<typeof panelSchema>;

export default function Form() {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();

  const panelIdNumber = Number(panelId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PanelFormData>({
    resolver: zodResolver(panelSchema) as any,
  });

  useEffect(() => {
    async function loadData() {
      const panel = await getPanel(panelIdNumber);
      if (panel) {
        reset(panel);
      }
    }

    void loadData();
  }, [panelId, reset]);

  async function onValidSubmit(data: PanelFormData) {
    try {
      await updatePanel(panelIdNumber, data);
      navigate(-1);
      Toast.success('Saved panel successfully.');
    } catch (error) {
      Toast.error('Failed to save panel!');
    }
  }

  return (
    <>
      <TopBar.Title text="Update Panel"/>
      <form onSubmit={handleSubmit(onValidSubmit)} className="ion-padding">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <Controller
            control={control}
            name="width"
            render={({ field }) => (
              <div style={{ flex: 1 }}>
                <NumberInput
                  label="Width"
                  errorText={errors.width?.message}
                  showValidation={!!errors.width}
                  className="ion-text-center"
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="height"
            render={({ field }) => (
              <div style={{ flex: 1 }}>
                <NumberInput
                  label="Height"
                  errorText={errors.height?.message}
                  showValidation={!!errors.height}
                  className="ion-text-center"
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="center"
            render={({ field }) => (
              <div style={{ flex: 1 }}>
                <NumberInput
                  label="Center"
                  errorText={errors.center?.message}
                  showValidation={!!errors.center}
                  className="ion-text-center"
                  last
                  {...field}
                />
              </div>
            )}
          />
        </div>

        <IonList style={{display: 'none'}}>

        </IonList>


        <IonButton type="submit" expand="block">
          <IonIcon slot="start" icon={icons.addOutline}/>
          Update Panel
        </IonButton>
      </form>
    </>
  )
    ;
}