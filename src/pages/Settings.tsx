import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect } from "react";
import { getSettings, updateSettings } from "@src/db/queries/settings.ts";
import { IonButton, IonIcon, IonList, useIonToast } from '@ionic/react';
import * as icons from 'ionicons/icons';
import { NumberInput } from '@src/components/Input.tsx';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const settingsSchema = z.object({
  hourlyRate: z.coerce.number(),
  evsMargin: z.coerce.number(),
  iguMargin: z.coerce.number(),
  sguRate: z.coerce.number(),
  igux2Rate: z.coerce.number(),
  productMargin: z.coerce.number(),
  travelRatePerKm: z.coerce.number(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const [present] = useIonToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema) as any,
  });

  useEffect(() => {
    getSettings().then((data) => {
      if (data) {
        reset(data);
      }
    });
  }, [reset]);

  async function onValidSubmit(data: SettingsFormData) {
    try {
      await updateSettings(data);

      void present({
        message: 'Settings updated successfully!',
        duration: 2500,
        color: 'primary',
        icon: icons.checkmarkCircleOutline,
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      void present({ message: 'Failed to save settings.', color: 'danger', });
    }
  }

  return (
    <>
      <TopBar.Title text="Settings"/>

      <form onSubmit={handleSubmit(onValidSubmit)} className="ion-padding">
        <IonList>
          <Controller
            control={control}
            name="hourlyRate"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="Hourly Rate" errorText={errors.hourlyRate?.message} showValidation={!!errors.hourlyRate} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="evsMargin"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="Evs Margin" errorText={errors.evsMargin?.message} showValidation={!!errors.evsMargin} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="iguMargin"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="IGU Margin" errorText={errors.iguMargin?.message} showValidation={!!errors.iguMargin} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="sguRate"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="SGU Margin" errorText={errors.sguRate?.message} showValidation={!!errors.sguRate} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="igux2Rate"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="IGUx2 Rate" errorText={errors.igux2Rate?.message} showValidation={!!errors.igux2Rate} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="productMargin"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="Product Margin" errorText={errors.productMargin?.message} showValidation={!!errors.productMargin} {...field}/>
              </div>
            )}
          />

          <Controller
            control={control}
            name="travelRatePerKm"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <NumberInput label="Travel Rate p/Km" errorText={errors.travelRatePerKm?.message} showValidation={!!errors.travelRatePerKm} {...field} last/>
              </div>
            )}
          />

        </IonList>

        <IonButton type="submit" expand="block">
          <IonIcon slot="start" icon={icons.createOutline}/>
          Update Settings
        </IonButton>
      </form>
    </>
  );
}