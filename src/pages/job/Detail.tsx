import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Job, type Room } from '@src/db/schema.ts';
import { TopBar } from "@src/components/TopBar.tsx";
import LoadingScreen from "@src/components/LoadingScreen.tsx";
import { getJob } from "@src/db/queries/job.ts";
import { getRooms } from "@src/db/queries/room.ts";

export default function Detail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobInstance, setJobInstance] = useState<Job | null>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const id = Number(jobId);

    if (!id || isNaN(id)) return;

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
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };

  }, [jobId]);

  if (loading) return <LoadingScreen/>;
  if (!jobInstance) return (<>
    <div>Job not found.</div>
  </>);
  return (<>
    <TopBar.Title text={jobInstance?.name}/>
    <TopBar.IconAction iconName="bi-pencil-fill" onClick={() => navigate(`/job/${jobInstance?.id}/update`)}/>
    <ul>{rooms.map(r => <li key={r.id}>{r.name}</li>)}</ul>
  </>);
}