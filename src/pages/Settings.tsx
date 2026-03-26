import { TopBar } from "@src/components/TopBar.tsx";
import React, { useEffect, useState } from "react";
import { type Settings } from '@src/db/schema.ts';
import { getSettings, updateSettings } from "@src/db/queries/settings.ts";
import { NumberInput } from '@src/components/Input.tsx';

export default function Settings() {
  const [settings, setSettings] = useState<Settings>();
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const handleFormSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const formData = new FormData(form);

    const updatedSettings = {
      hourlyRate: Number(formData.get('hourlyRate')),
      evsMargin: Number(formData.get('evsMargin')),
      iguMargin: Number(formData.get('iguMargin')),
      sguRate: Number(formData.get('sguRate')),
      igux2Rate: Number(formData.get('igux2Rate')),
      productMargin: Number(formData.get('productMargin')),
      travelRatePerKm: Number(formData.get('travelRatePerKm'))
    };

    try {
      const updated = await updateSettings(updatedSettings)
      setSettings(updated);
      setValidated(false);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <>
      <TopBar.Title text="Settings"/>

      <form
        noValidate
        onSubmit={handleFormSubmit}
        className={`d-flex flex-column flex-fill ${validated ? 'was-validated' : ''}`}
      >
        <NumberInput label="Hourly Rate" id="hourlyRate" defaultValue={settings.hourlyRate} enterKeyHint="next"/>
        <NumberInput label="Evs Margin" id="evsMargin" defaultValue={settings.evsMargin} enterKeyHint="next"/>
        <NumberInput label="IGU Margin" id="iguMargin" defaultValue={settings.iguMargin} enterKeyHint="next"/>
        <NumberInput label="SGU Margin" id="sguRate" defaultValue={settings.sguRate} enterKeyHint="next"/>
        <NumberInput label="IGUx2 Rate" id="igux2Rate" defaultValue={settings.igux2Rate} enterKeyHint="next"/>
        <NumberInput label="Product Margin" id="productMargin" defaultValue={settings.productMargin} enterKeyHint="next"/>
        <NumberInput label="Travel Rate p/Km" id="travelRatePerKm" defaultValue={settings.travelRatePerKm} enterKeyHint="done"/>

        <button className="btn btn-primary btn-lg align-self-end mt-auto w-100" type="submit">Update</button>
      </form>
    </>
  );
}
