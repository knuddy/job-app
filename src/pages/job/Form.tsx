import { TopBar } from "@src/components/TopBar.tsx";
import React, { useEffect, useState } from "react";
import { type Settings, type Job } from "@src/db/schema.ts";
import { getSettings } from "@src/db/queries/settings.ts";
import { getJob, createJob, updateJob } from "@src/db/queries/job.ts";
import { useNavigate, useParams } from "react-router-dom";
import { Input, NumberInput } from "@src/components/Input.tsx";


export default function Form() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobInstance, setJobInstance] = useState<Job | null>();
  const [jobLoaded, setJobLoaded] = useState(false);
  const [settings, setSettings] = useState<Settings>();
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setJobInstance(null);
    setJobLoaded(false);
    setValidated(false);

    async function loadData() {
      const id = Number(jobId);
      const settings = await getSettings();

      let job;
      if (id && !isNaN(id)) {
        job = await getJob(id);
      }

      if (isMounted) {
        setSettings(settings);
        setJobInstance(job);
        setJobLoaded(true);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    }

  }, [jobId]);

  if (!settings || !jobLoaded) return null;

  const handleFormSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const formData = new FormData(form);

    const jobFormData = {
      name: String(formData.get("name")),
      hourlyRate: Number(formData.get("hourlyRate")),
      evsMargin: Number(formData.get("evsMargin")),
      iguMargin: Number(formData.get("iguMargin")),
      sguRate: Number(formData.get("sguRate")),
      igux2Rate: Number(formData.get("igux2Rate")),
      productMargin: Number(formData.get("productMargin")),
      travelRatePerKm: Number(formData.get("travelRatePerKm"))
    };

    try {
      if (jobInstance) {
        await updateJob(jobInstance.id, jobFormData);
        navigate(-1);
      } else {
        const created = await createJob(jobFormData);
        navigate(`/job/${created.id}`, {replace: true});
      }
      setValidated(false);
    } catch (error) {
      console.error("Failed to process form:", error);
    }
  };

  return (
    <>
      <TopBar.Title text={jobInstance ? "Update Job" : "Create Job"}/>

      <form
        noValidate
        key={jobId || 'new'}
        onSubmit={handleFormSubmit}
        className={`d-flex flex-column flex-fill ${validated ? "was-validated" : ""}`}
      >
        <Input
          label="Name"
          id="name"
          invalidFeedback="Name cannot be empty"
          defaultValue={jobInstance?.name || ""}
          enterKeyHint="enter"
        />
        <NumberInput
          label="Hourly Rate"
          id="hourlyRate"
          defaultValue={jobInstance?.hourlyRate ?? settings.hourlyRate}
          enterKeyHint="next"
        />
        <NumberInput
          label="Evs Margin"
          id="evsMargin"
          defaultValue={jobInstance?.evsMargin ?? settings.evsMargin}
          enterKeyHint="next"
        />
        <NumberInput
          label="IGU Margin"
          id="iguMargin"
          defaultValue={jobInstance?.iguMargin ?? settings.iguMargin}
          enterKeyHint="next"
        />
        <NumberInput
          label="SGU Margin"
          id="sguRate"
          defaultValue={jobInstance?.sguRate ?? settings.sguRate}
          enterKeyHint="next"
        />
        <NumberInput
          label="IGUx2 Rate"
          id="igux2Rate"
          defaultValue={jobInstance?.igux2Rate ?? settings.igux2Rate}
          enterKeyHint="next"
        />
        <NumberInput
          label="Product Margin"
          id="productMargin"
          defaultValue={jobInstance?.productMargin ?? settings.productMargin}
          enterKeyHint="next"
        />
        <NumberInput
          label="Travel Rate p/Km"
          id="travelRatePerKm"
          defaultValue={jobInstance?.travelRatePerKm ?? settings.travelRatePerKm}
          enterKeyHint="done"
        />
        <button
          type="submit"
          className={`btn ${jobInstance ? "btn-primary" : "btn-success"} btn-lg align-self-end mt-auto w-100`}
        >
          {jobInstance ? "Update" : "Create"}
        </button>
      </form>
    </>
  )
    ;
}