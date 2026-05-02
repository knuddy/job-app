import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NumberInput } from "@src/components/form/Input.tsx";
import * as icons from 'ionicons/icons';
import { IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@src/hooks/useToast.tsx';
import { getPanel, type PanelWithOrdinal, updatePanel } from '@src/db/queries/panel.ts';
import styleTypes from '@src/db/lookups/style-types.ts';
import safetyOptions from '@src/db/lookups/safety-options.ts';
import glassTypes from '@src/db/lookups/glass-types.ts';


const panelSchema = z.object({
  width: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  height: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  center: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  styleType: z.enum(styleTypes.map(v => v.name)),
  safetyType: z.enum(safetyOptions.map(v => v.name)),
  glassType: z.enum(glassTypes.map(v => v.name)),
});

type PanelFormData = z.infer<typeof panelSchema>;

export default function Form() {
  const { panelId } = useParams<{ panelId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();
  const [panel, setPanel] = useState<PanelWithOrdinal | null>();
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        const instance = await getPanel(panelIdNumber);
        if (instance) {
          reset(instance);
          setPanel(instance);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
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


  if (loading) return null;
  if (!panel?.id) throw new Response("Panel Not Found", { status: 404, statusText: "Panel Not Found" });

  return (
    <>
      <TopBar.Title text={`Panel ${panel.ordinal}`}/>
      <form
        onSubmit={handleSubmit(onValidSubmit)}
        className="ion-padding ion-display-flex ion-flex-column"
        style={{ minHeight: '100%' }}
      >
        <div className="ion-flex-1">
          <div className="ion-display-flex ion-margin-bottom" style={{ gap: '8px' }}>
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

          <Controller
            control={control}
            name="styleType"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <IonSelect
                  label="Style Type"
                  labelPlacement="stacked"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value)}
                  errorText={errors.styleType?.message}
                  className={`${errors.styleType ? 'ion-invalid ion-touched' : ''}`}
                >
                  {styleTypes.map((v) => (
                    <IonSelectOption key={v.name} value={v.name}>
                      {v.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            )}
          />

          <Controller
            control={control}
            name="safetyType"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <IonSelect
                  label="Safety Option"
                  labelPlacement="stacked"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value)}
                  errorText={errors.safetyType?.message}
                  className={`${errors.safetyType ? 'ion-invalid ion-touched' : ''}`}
                >
                  {safetyOptions.map((v) => (
                    <IonSelectOption key={v.name} value={v.name}>
                      {v.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            )}
          />

          <Controller
            control={control}
            name="glassType"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <IonSelect
                  label="Glass Type"
                  labelPlacement="stacked"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value)}
                  errorText={errors.glassType?.message}
                  className={`${errors.glassType ? 'ion-invalid ion-touched' : ''}`}
                >
                  {glassTypes.map((v) => (
                    <IonSelectOption key={v.name} value={v.name}>
                      {v.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            )}
          />

        </div>

        <IonButton type="submit" expand="block">
          <IonIcon slot="start" icon={icons.addOutline}/>
          Update Panel
        </IonButton>
      </form>
    </>
  )
    ;
}