import { TopBar } from "@src/components/TopBar.tsx";
import { useEffect } from "react";
import { getRoom, updateRoom } from "@src/db/queries/room.ts";
import { useNavigate, useParams } from "react-router-dom";
import * as icons from 'ionicons/icons';
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import roomNames from '@src/db/lookups/room-names.ts';
import { useToast } from '@src/hooks/useToast.tsx';
import { TextArea } from '@src/components/form/TextArea.tsx';

const roomSchema = z.object({
  name: z.union([z.enum(roomNames), z.literal('')]),
  jobId: z.number(),
  notes: z.string().default(''),
}).refine((data) => data.name !== '', {
  // Point the error specifically at the 'name' field
  message: "Please select a room name",
  path: ['name'],
});

type RoomFormData = z.infer<typeof roomSchema>;

export default function Form() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
  });

  const roomIdNumber = Number(roomId);

  useEffect(() => {
    async function loadData() {
      const room = await getRoom(roomIdNumber);
      if (room) {
        reset(room);
      }
    }

    void loadData();
  }, [roomId, reset]);

  async function onValidSubmit(data: RoomFormData) {
    const dataCoerced = data as {
      name: typeof roomNames[number];
      jobId: number;
    };

    try {
      await updateRoom(roomIdNumber, dataCoerced);
      Toast.success('Saved room successfully.');
      navigate(-1);
    } catch (error) {
      Toast.error('Failed to save room!');
    }
  }

  return (
    <>
      <TopBar.Title text={"Update Room"}/>

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
                <IonSelect
                  label="Room Name"
                  labelPlacement="stacked"
                  placeholder="Select a room"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value)}
                  errorText={errors.name?.message}
                  className={`${errors.name ? 'ion-invalid ion-touched' : ''}`}
                >
                  {roomNames.map((name) => (
                    <IonSelectOption key={name} value={name}>
                      {name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
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

        <IonButton slot="end" type="submit" expand="block">
          <IonIcon slot="start" icon={icons.createOutline}/>
          Update Room
        </IonButton>
      </form>
    </>
  );
}