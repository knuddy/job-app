import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect } from "react";
import { getSettings } from "@src/db/queries/settings.ts";
import { getJob, createJob, updateJob } from "@src/db/queries/job.ts";
import { useNavigate, useParams } from "react-router-dom";
import { Input, NumberInput } from "@src/components/form/Input.tsx";
import { TextArea } from '@src/components/form/TextArea.tsx';
import * as icons from 'ionicons/icons';
import { IonButton, IonIcon } from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@src/hooks/useToast.tsx';

const jobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hourlyRate: z.coerce.number(),
  evsMargin: z.coerce.number(),
  iguMargin: z.coerce.number(),
  sguRate: z.coerce.number(),
  igux2Rate: z.coerce.number(),
  productMargin: z.coerce.number(),
  travelRatePerKm: z.coerce.number(),
  notes: z.string().default("")
});

type JobFormData = z.infer<typeof jobSchema>;

export default function Form() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,
  });

  const isEditMode = Boolean(jobId);
  const jobIdNumber = Number(jobId);

  useEffect(() => {
    async function loadData() {
      const settings = await getSettings();

      if (isEditMode) {
        const job = await getJob(jobIdNumber);
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
          travelRatePerKm: settings.travelRatePerKm,
          notes: '',
        });
      }
    }

    void loadData();
  }, [isEditMode, jobId, reset]);

  async function onValidSubmit(data: JobFormData) {
    try {
      if (isEditMode) {
        await updateJob(jobIdNumber, data);
        navigate(-1);
      } else {
        const created = await createJob(data);
        navigate(`/job/${created.id}`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      Toast.error('Failed to save job!');
    }
  }

  return (
    <>
      <TopBar.Title text={isEditMode ? "Update Job" : "Create Job"}/>

      <form
        onSubmit={handleSubmit(onValidSubmit)}
        className="ion-padding ion-display-flex ion-flex-column"
        style={{ minHeight: '100%' }}
      >
        <div className="ion-flex-1">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <Input label="Name" errorText={errors.name?.message} showValidation={!!errors.name} {...field}/>
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

          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <div className="ion-margin-bottom">
                <TextArea
                  label="Notes"
                  placeholder="Enter any notes here"
                  required={false}
                  errorText={errors.notes?.message}
                  showValidation={!!errors.notes}
                  {...field}
                />
              </div>
            )}
          />
        </div>

        <IonButton type="submit" expand="block">
          <IonIcon slot="start" icon={isEditMode ? icons.createOutline : icons.addOutline}/>
          {jobId ? "Update Job" : "Create Job"}
        </IonButton>
      </form>
    </>
  )
    ;
}