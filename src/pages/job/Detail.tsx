import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Job, type Room } from '@src/db/schema.ts';
import { TopBar } from "@src/components/TopBar.tsx";
import { getJob } from "@src/db/queries/job.ts";
import { getRooms } from "@src/db/queries/room.ts";
import * as icons from 'ionicons/icons';
import { IonItem, IonList, IonSkeletonText } from '@ionic/react';


export default function Detail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobInstance, setJobInstance] = useState<Job | null>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const id = Number(jobId);

    const timer = setTimeout(() => {
      if (isMounted) {
        setShowLoading(true);
      }
    }, 200);

    async function loadData() {
      setLoading(true);
      try {
        const [jobQuery, roomsQuery] = await Promise.all([getJob(id), getRooms(id)]);

        if (isMounted) {
          setJobInstance(jobQuery || null);
          setRooms(roomsQuery);
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

  }, [jobId]);

  if (loading && !showLoading) return null;
  if (!jobInstance) return <div>Job not found.</div>;
  if (loading) return <DetailSkeleton/>

  return (<>
    <TopBar.Title text={jobInstance?.name}/>
    <TopBar.IconAction icon={icons.createOutline} onClick={() => navigate(`/job/${jobInstance?.id}/update`)}/>


    <ul>{rooms.map(r => <li key={r.id}>{r.name}</li>)}</ul>
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