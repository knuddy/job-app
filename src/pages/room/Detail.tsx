import { TopBar } from "@src/components/TopBar.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoom, type RoomWithOrdinal } from '@src/db/queries/room.ts';
import { deleteWindow, getWindows, createWindow, type WindowWithCount } from '@src/db/queries/window.ts';
import * as icons from 'ionicons/icons';
import {
  IonActionSheet,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
} from '@ionic/react';
import { useItemConfirmation, useSimpleConfirmation } from '@src/hooks/useConfirmation.ts';
import { useToast } from '@src/hooks/useToast.tsx';

export default function Detail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();
  const [room, setRoom] = useState<RoomWithOrdinal | null>();
  const [windows, setWindows] = useState<WindowWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const roomIdNumber = Number(roomId);

  const refreshWindowList = async () => setWindows(await getWindows(roomIdNumber));

  const deleteAction = useItemConfirmation<WindowWithCount>(async (selected) => {
    await deleteWindow(selected.id);
    void refreshWindowList();
  });

  const creationAction = useSimpleConfirmation(async () => {
    if (!room) return;

    try {
      const created = await createWindow(room);
      navigate(`/window/${created.id}`);
    } catch (error) {
      Toast.error('Failed to create window');
    }
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [roomQuery, windowsQuery] = await Promise.all([getRoom(roomIdNumber), getWindows(roomIdNumber)]);
        setRoom(roomQuery);
        setWindows(windowsQuery);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [roomId]);

  if (loading) return null;
  if (!room?.id) throw new Response("Room Not Found", { status: 404, statusText: "Room Not Found" });

  return (<>
    <TopBar.Title text={`${room.name} ${room.ordinal}`}/>
    <TopBar.Action icon={icons.createOutline} onClick={() => navigate(`/room/${room.id}/update`)}/>

    <IonList lines="full" className="ion-no-padding">
      {windows.map(window => {
        return (
          <IonItemSliding key={window.id}>
            <IonItem button detail={true} onClick={() => navigate(`/window/${window.id}`)}>
              <IonLabel>{window.displayText}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                expandable={true}
                onClick={() => deleteAction.openConfirmation(window)}
              >
                <IonIcon slot="icon-only" icon={icons.trashOutline}/>
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        )
      })}
    </IonList>

    <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
      <IonFabButton color="primary" onClick={() => creationAction.openConfirmation()}>
        <IonIcon icon={icons.add}/>
      </IonFabButton>
    </IonFab>

    <IonActionSheet
      isOpen={creationAction.isOpen}
      header={`Create Window?`}
      onDidDismiss={creationAction.dismiss}
      buttons={[
        { text: 'Confirm', role: 'selected', icon: icons.createOutline, handler: creationAction.executeAction },
        { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: creationAction.dismiss },
      ]}
    />

    <IonActionSheet
      isOpen={deleteAction.isOpen}
      header={`Delete ${deleteAction.selectedItem?.displayText}?`}
      subHeader="This action cannot be undone."
      onDidDismiss={deleteAction.dismiss}
      buttons={[
        { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: deleteAction.executeAction },
        { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: deleteAction.dismiss },
      ]}
    />
  </>);
}

// const windowSchema = z.object({
//   panelCount: z.coerce.number().min(1, "Must have at least 1 panel").max(30, "Maximum 30 panels"),
// });
//
// type WindowFormData = z.infer<typeof windowSchema>;
//
// interface Props {
//   isOpen: boolean;
//   onDismiss: () => void;
//   onSave: (value: number) => void;
// }
//
// export function WindowCreationModal({ isOpen, onDismiss, onSave }: Props) {
//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors }
//   } = useForm<WindowFormData>({
//     resolver: zodResolver(windowSchema) as any,
//     defaultValues: { panelCount: 1 }
//   });
//
//   useEffect(() => {
//     if (isOpen) {
//       reset({ panelCount: 1 });
//     }
//   }, [isOpen, reset]);
//
//   const onSubmit = (data: WindowFormData) => {
//     onSave(data.panelCount);
//     onDismiss();
//   };
//
//   return (
//     <IonModal
//       isOpen={isOpen}
//       onDidDismiss={onDismiss}
//       initialBreakpoint={0.3}
//       breakpoints={[0, 0.3]}
//       handle={false}
//     >
//       <IonContent className="ion-padding">
//         <div className="ion-display-flex ion-align-items-center ion-justify-content-between ion-margin-bottom">
//           <h2 style={{ margin: 0, fontSize: '1.2rem'}}>Number of Panels</h2>
//           <IonButton fill="clear" color="medium" onClick={onDismiss} className="ion-no-margin">
//             <IonIcon slot="icon-only" icon={icons.closeOutline} />
//           </IonButton>
//         </div>
//
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <IonList className="ion-no-margin ion-margin-bottom">
//             <Controller
//               control={control}
//               name="panelCount"
//               render={({ field }) => (
//                 <NumberInput
//                   label="Number of Panels"
//                   errorText={errors.panelCount?.message}
//                   showValidation={!!errors.panelCount}
//                   className="ion-text-center"
//                   autofocus
//                   last
//                   {...field}
//                 />
//               )}
//             />
//           </IonList>
//
//           <IonButton type="submit" expand="block">Confirm</IonButton>
//         </form>
//       </IonContent>
//
//     </IonModal>
//   );
// }