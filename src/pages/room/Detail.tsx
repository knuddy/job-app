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
  const [room, setRoom] = useState<RoomWithOrdinal | null>();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const id = Number(roomId);
    const timer = setTimeout(() => setShowLoading(true), 200);

    async function loadData() {
      setLoading(true);
      try {
        const roomQuery = await getRoom(id);
        setRoom(roomQuery || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    }

    void loadData();
  }, [roomId]);

  if (loading && !showLoading) return null;
  if (loading) return <DetailSkeleton/>
  if (!room?.id) throw new Response("Room Not Found", {
    status: 404,
    statusText: "Room Not Found"
  });

  return (<>
    <TopBar.Title text={`${room.name} ${room.ordinal}`}/>
    <TopBar.Action icon={icons.createOutline} onClick={() => navigate(`/room/${room.id}/update`)}/>
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