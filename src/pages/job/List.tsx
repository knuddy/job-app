import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopBar } from "@src/components/TopBar.tsx";
import { getAllJobs, deleteJob } from "@src/db/queries/job.ts";
import { type Job } from "@src/db/schema.ts";
import { createPortal } from 'react-dom';

export default function List() {
  const navigate = useNavigate();
  const [data, setData] = useState<Job[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    getAllJobs().then(setData);
  }, []);

  const openConfirm = (job: Job) => {
    setSelectedJob(job);
    setSheetOpen(true);
  };

  async function handleExecuteDelete() {
    if (selectedJob) {
      await deleteJob(selectedJob.id);
      setData(prev => prev.filter(j => j.id !== selectedJob.id));
    }
    setSheetOpen(false);
  }

  return (<>
    <TopBar.Title text="Jobs"/>
    <TopBar.IconAction iconName="bi-gear-fill" onClick={() => navigate('settings')}/>

    <div className="flex-fill overflow-y-auto">
      <div className="list-group flex-fill">
        {
          data.map(job => {
            return (
              <div key={job.id} className="list-group-item list-group-item-action d-flex p-0">
                <Link
                  to={`/job/${job.id}`}
                  className="flex-fill py-2 px-3 text-decoration-none d-flex justify-content-between align-items-center"
                >
                  <span className="fs-4">{job.name}</span>
                  <i className="bi bi-chevron-right text-muted"></i>
                </Link>
                <button
                  onClick={() => openConfirm(job)}
                  className="btn btn-outline-danger rounded-start-0 border-0 px-4"
                  title="Delete Job"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            )
          })
        }
      </div>
    </div>
    <button
      onClick={() => {
        navigate('job/create')
      }}
      className="btn btn-success position-absolute bottom-0 end-0 m-3 shadow fs-5 z-3 d-flex align-items-center gap-1 px-3 py-2"
    >
      <i className="bi bi-plus"></i>
      <span>Create New</span>
    </button>

    <DeleteJobSheet
      show={sheetOpen}
      jobName={selectedJob?.name || null}
      onClose={() => setSheetOpen(false)}
      onConfirm={handleExecuteDelete}
    />

  </>);
}

function DeleteJobSheet({
  show,
  jobName,
  onClose,
  onConfirm
}: {
  show: boolean;
  jobName: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!show) return null;

  return createPortal(
    <>
      <div
        className="offcanvas-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>
      <div
        className="offcanvas offcanvas-bottom show border-top-0 rounded-top-4 shadow-lg"
        style={{ zIndex: 1050, visibility: 'visible', height: 'auto' }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title text-danger fw-semibold">Delete Job</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="offcanvas-body py-4">
          <p className="fs-5 mb-4">Are you sure you want to delete <strong>{jobName}</strong>?</p>
          <div className="d-grid gap-2">
            <button className="btn btn-danger py-3 fw-semibold" onClick={onConfirm}>Delete Job</button>
            <button className="btn btn-light py-3 text-muted" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}