import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { TopBar } from "@src/components/TopBar.tsx";
import { type Job, getJob } from '@src/db/queries/job.ts';
import { getRooms, deleteRoom, type RoomWithOrdinal, createRoom } from "@src/db/queries/room.ts";
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
  IonSelect, IonSelectOption,
  IonSkeletonText,
} from '@ionic/react';
import { useConfirmation } from '@src/hooks/useConfirmation.ts';
import roomNames from '@src/db/lookups/room-names.ts';
import { useToast } from '@src/hooks/useToast.tsx';


export default function Detail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();
  const [job, setJob] = useState<Job | null>();
  const [rooms, setRooms] = useState<RoomWithOrdinal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const roomNameSelectRef = useRef<HTMLIonSelectElement>(null);

  const jobIdNumber = Number(jobId);

  const refreshRoomsList = async () => setRooms(await getRooms(jobIdNumber));

  const {
    selectedItem,
    openConfirmation,
    dismiss,
    executeAction,
    isOpen
  } = useConfirmation<RoomWithOrdinal>(async (selected) => {
    await deleteRoom(selected.id);
    void refreshRoomsList();
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 200);

    async function loadData() {
      setLoading(true);
      try {
        const [jobQuery, roomsQuery] = await Promise.all([getJob(jobIdNumber), getRooms(jobIdNumber)]);
        setJob(jobQuery || null);
        setRooms(roomsQuery);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    }

    void loadData();
  }, [jobId]);

  if (loading && !showLoading) return null;
  if (loading) return <DetailSkeleton/>
  if (!job?.id) throw new Response("Job Not Found", { status: 404, statusText: "Job Not Found" });


  const onRoomSelected = async (name: string) => {
    if (!name) return;

    try {
      await createRoom({ name: name as any, jobId: jobIdNumber });
      await refreshRoomsList();

      if (roomNameSelectRef.current) {
        roomNameSelectRef.current.value = null;
      }

      Toast.success(`${name} added`);
    } catch (error) {
      Toast.error('Failed to create room');
    }
  };

  return (<>
    <TopBar.Title text={job.name}/>
    <TopBar.Action icon={icons.createOutline} onClick={() => navigate(`/job/${job.id}/update`)}/>

    <IonList lines="full" className="ion-no-padding">
      {rooms.map(room => {
        return (
          <IonItemSliding key={room.id}>
            <IonItem button detail={true} onClick={() => navigate(`/room/${room.id}`)}>
              <IonLabel>{room.name} {room.ordinal}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                expandable={true}
                onClick={() => openConfirmation(room)}
              >
                <IonIcon slot="icon-only" icon={icons.trashOutline}/>
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        )
      })}
    </IonList>

    <IonSelect
      className="ion-hide"
      ref={roomNameSelectRef}
      interface="action-sheet"
      onIonChange={e => onRoomSelected(e.detail.value)}
      interfaceOptions={{
        header: 'Room Names',
      }}
    >
      {roomNames.map(name => (
        <IonSelectOption key={name} value={name}>
          {name}
        </IonSelectOption>
      ))}
    </IonSelect>

    <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
      <IonFabButton color="primary" onClick={() => roomNameSelectRef.current?.open()}>
        <IonIcon icon={icons.add}/>
      </IonFabButton>
    </IonFab>

    <IonActionSheet
      isOpen={isOpen}
      header={`Delete ${selectedItem?.name} ${selectedItem?.ordinal}?`}
      subHeader="This action cannot be undone."
      onDidDismiss={dismiss}
      buttons={[
        { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: executeAction },
        { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: dismiss },
      ]}
    />
  </>);
}

function DetailSkeleton() {
  return (
    <IonList>
      <IonItem>
        <IonSkeletonText animated style={{ width: '60%' }}></IonSkeletonText>
      </IonItem>
      <IonItem>
        <IonSkeletonText animated style={{ width: '80%' }}/>
      </IonItem>
    </IonList>
  );
}