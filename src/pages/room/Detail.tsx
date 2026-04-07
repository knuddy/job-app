import { TopBar } from "@src/components/TopBar.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoom, RoomWithOrdinal } from '@src/db/queries/room.ts';
import * as icons from 'ionicons/icons';
import { IonItem, IonList, IonSkeletonText } from '@ionic/react';

export default function Detail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roomInstance, setRoomInstance] = useState<RoomWithOrdinal | null>();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const id = Number(roomId);

    const timer = setTimeout(() => {
      if (isMounted) {
        setShowLoading(true);
      }
    }, 200);

    async function loadData() {
      setLoading(true);
      try {
        const roomQuery = await getRoom(id);
        if (isMounted) {
          setRoomInstance(roomQuery || null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };

  }, [roomId]);

  if (loading && !showLoading) return null;
  if (loading) return <DetailSkeleton/>

  if (!roomInstance || roomInstance.id === undefined) throw {
    status: 404,
    statusText: "Room Not Found",
    data: "The room you are looking for does not exist in the local database.",
    internal: true
  };

  return (<>
    <TopBar.Title text={`${roomInstance.name} ${roomInstance.ordinal}`}/>
    <TopBar.Action icon={icons.createOutline} onClick={() => navigate(`/room/${roomInstance?.id}/update`)}/>
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