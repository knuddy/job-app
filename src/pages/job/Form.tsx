import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect } from "react";
import { getSettings } from "@src/db/queries/settings.ts";
import { getJob, createJob, updateJob } from "@src/db/queries/job.ts";
import { useNavigate, useParams } from "react-router-dom";
import { Input, NumberInput } from "@src/components/Input.tsx";
import * as icons from 'ionicons/icons';
import { IonButton, IonFooter, IonIcon, IonList, IonToolbar, useIonToast } from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const jobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hourlyRate: z.coerce.number(),
  evsMargin: z.coerce.number(),
  iguMargin: z.coerce.number(),
  sguRate: z.coerce.number(),
  igux2Rate: z.coerce.number(),
  productMargin: z.coerce.number(),
  travelRatePerKm: z.coerce.number(),
});

type JobFormData = z.infer<typeof jobSchema>;

export default function Form() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [present] = useIonToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,
  });

  useEffect(() => {
    async function loadData() {
      const id = Number(jobId);
      const settings = await getSettings();

      if (id && !isNaN(id)) {
        const job = await getJob(id);
        if (job) {
          reset(job);
        }
      } else if (settings) {
        reset({
          name: '',
          hourlyRate: settings.hourlyRate,
          evsMargin: settings.evsMargin,
          iguMargin: settings.iguMargin,
          sguRate: settings.sguRate,
          igux2Rate: settings.igux2Rate,
          productMargin: settings.productMargin,
          travelRatePerKm: settings.travelRatePerKm
        });
      }
    }

    void loadData();
  }, [jobId, reset]);

  async function onValidSubmit(data: JobFormData) {
    try {
      const id = Number(jobId);
      if (id && !isNaN(id)) {
        await updateJob(id, data);
        navigate(-1);
      } else {
        const created = await createJob(data);
        navigate(`/job/${created.id}`, { replace: true });
      }
      void present({
        message: 'Saved job successfully.',
        duration: 3000,
        color: 'primary',
        icon: icons.checkmarkCircleOutline
      });
    } catch (error) {
      void present({ message: 'Failed to save job!', color: 'danger' });
    }
  }

  return (
    <>
      <TopBar.Title text={jobId ? "Update Job" : "Create Job"}/>

      <form onSubmit={handleSubmit(onValidSubmit)} className="ion-padding">
        <IonList>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <Input label="Hourly Rate" errorText={errors.hourlyRate?.message} showValidation={!!errors.hourlyRate} {...field}/>
              </div>
            )}
          />

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

        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonButton slot="end" type="submit">
              <IonIcon slot="start" icon={jobId ? icons.createOutline : icons.addOutline}/>
              {jobId ? "Update Job" : "Create Job"}
            </IonButton>
          </IonToolbar>
        </IonFooter>


      </form>
    </>
  )
    ;
}