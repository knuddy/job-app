import { TopBar } from "@src/components/TopBar.tsx";
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getWindow, type WindowWithCount } from '@src/db/queries/window.ts';
import { type PanelWithOrdinal, deletePanel, getPanels, duplicatePanel, createPanel, updatePanel } from '@src/db/queries/panel.ts';
import { deleteWindowExtra, getWindowExtras, createWindowExtra, updateWindowExtra, type WindowExtra } from '@src/db/queries/windowExtra.ts';
import {
  IonActionSheet,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList, IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton, IonSelect, IonSelectOption,
} from '@ionic/react';
import * as icons from 'ionicons/icons';
import { useItemConfirmation } from '@src/hooks/useConfirmation.ts';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { NumberInput } from '@src/components/form/Input.tsx';
import { useToast } from '@src/hooks/useToast.tsx';
import { Job } from '@src/db/queries/job.ts';
import styleTypes from '@src/db/lookups/style-types.ts';
import safetyOptions from '@src/db/lookups/safety-options.ts';
import glassTypes from '@src/db/lookups/glass-types.ts';
import extrasOptions from '@src/db/lookups/extras-options.ts';
import { calcGlassCost, calcPanelLabourHoursAndCosts, calcWindowExtraCosts } from '@src/logic/pricing.ts';

type TabOptions = 'panels' | 'extras';

export default function Detail() {
  const { windowId } = useParams<{ windowId: string }>();
  const { Toast } = useToast();
  const [window, setWindow] = useState<WindowWithCount | null>();
  const [panels, setPanels] = useState<PanelWithOrdinal[]>([]);
  const [extras, setExtras] = useState<WindowExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLIonListElement>(null);
  const [activeTab, setActiveTab] = useState<TabOptions>('panels');
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<PanelWithOrdinal | null>(null);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<WindowExtra | null>(null);

  const windowIdNumber = Number(windowId);

  const refreshPanelList = async () => {
    if (listRef.current) {
      await listRef.current.closeSlidingItems();
    }

    const [updatedPanels, updatedWindow] = await Promise.all([
      getPanels(windowIdNumber),
      getWindow(windowIdNumber)
    ]);

    setPanels(updatedPanels);
    setWindow(updatedWindow);
  };

  const panelDeleteAction = useItemConfirmation<PanelWithOrdinal>(async (selected) => {
    try {
      await deletePanel(selected.id);
      void refreshPanelList();
    } catch (error) {
      Toast.error('Failed to delete panel');
    }
  });

  const duplicateAction = useItemConfirmation<PanelWithOrdinal>(async (selected) => {
    try {
      await duplicatePanel(selected);
      void refreshPanelList();
    } catch (error) {
      Toast.error('Failed to duplicate panel');
    }
  });

  const refreshExtraList = async () => {
    const updatedExtras = await getWindowExtras(windowIdNumber);
    setExtras(updatedExtras);
  };

  const extraDeleteAction = useItemConfirmation<WindowExtra>(async (selected) => {
    try {
      await deleteWindowExtra(selected.id);
      void refreshExtraList();
    } catch (error) {
      Toast.error('Failed to delete window extra');
    }
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [windowQuery, panelsQuery, extrasQuery] = await Promise.all([
          getWindow(windowIdNumber),
          getPanels(windowIdNumber),
          getWindowExtras(windowIdNumber),
        ]);

        setWindow(windowQuery);
        setPanels(panelsQuery);
        setExtras(extrasQuery);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [windowId]);

  if (loading) return null;
  if (!window?.id) throw new Response("Window Not Found", { status: 404, statusText: "Window Not Found" });

  const handleOpenPanelModal = (panel?: PanelWithOrdinal) => {
    setSelectedPanel(panel || null); // null means create New
    setIsPanelModalOpen(true);
  };

  const handleSavePanel = async (data: PanelFormData) => {

    const glassCost = calcGlassCost(data.width, data.height, data.center, data.safetyType, data.glassType);
    const { dgHour, dgCost, evsCost, evsHour } = calcPanelLabourHoursAndCosts(data.width, data.height, data.center, data.styleType, window.job);

    try {
      if (selectedPanel) {
        // Edit existing
        await updatePanel(selectedPanel.id, {
          width: data.width,
          height: data.height,
          center: data.center,
          styleType: data.styleType,
          safetyType: data.safetyType,
          glassType: data.glassType,
          glassCost: glassCost,
          dgHour: dgHour,
          dgCost: dgCost,
          evsHour: evsHour,
          evsCost: evsCost

        });
      } else {
        // Create new
        await createPanel({
          windowId: windowIdNumber,
          width: data.width,
          height: data.height,
          center: data.center,
          styleType: data.styleType,
          safetyType: data.safetyType,
          glassType: data.glassType,
          glassCost: glassCost,
          dgHour: dgHour,
          dgCost: dgCost,
          evsHour: evsHour,
          evsCost: evsCost
        });
      }
      await refreshPanelList();
    } catch (error) {
      Toast.error('Failed to save panel');
    }
  };

  const handleOpenExtraModal = (extra?: WindowExtra) => {
    setSelectedExtra(extra || null); // null means create New
    setIsExtraModalOpen(true);
  };

  const handleSaveExtra = async (data: WindowExtraFormData) => {
    try {
      const { totalCost } = calcWindowExtraCosts(data.option, data.quantity, window.job);

      if (selectedExtra) {
        // Edit existing
        await updateWindowExtra(selectedExtra.id, {
          option: data.option,
          quantity: data.quantity,
          totalCost: totalCost
        });
      } else {
        // Create new
        await createWindowExtra({
          windowId: windowIdNumber,
          option: data.option,
          quantity: data.quantity,
          totalCost: totalCost
        });
      }

      void refreshExtraList();
    } catch (error) {
      Toast.error('Failed to save extra');
    }
  };

  return (
    <>
      <TopBar.Title text={`${window.displayText}`}/>

      <IonSegment
        value={activeTab}
        onIonChange={(e) => setActiveTab(e.detail.value as TabOptions)}
        style={{ padding: '8px 0' }}
      >
        <IonSegmentButton value="panels">
          <IonLabel>Panels ({panels.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="extras">
          <IonLabel>Extras ({extras.length})</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {activeTab === 'panels' && (<>
        <IonList ref={listRef} lines="full" className="ion-no-padding">
          {panels.map(panel => {
            return (
              <IonItemSliding key={panel.id}>
                <IonItem button detail={true} onClick={() => handleOpenPanelModal(panel)}>
                  <IonLabel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontWeight: 'bold' }}>Panel {panel.ordinal}</h2>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>
                      {panel.styleType}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                      {panel.safetyType} • {panel.glassType}
                    </p>
                  </IonLabel>

                  <div slot="end" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <IonNote color="dark" style={{ fontSize: '1.1rem' }} className="ion-margin-end">
                      {panel.width} × {panel.height} <small style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)' }}>mm</small>
                    </IonNote>
                  </div>

                </IonItem>

                <IonItemOptions side="start">
                  <IonItemOption
                    color="primary"
                    expandable={true}
                    onClick={() => duplicateAction.openConfirmation(panel)}
                  >
                    <IonIcon slot="icon-only" icon={icons.sparklesSharp}/>
                  </IonItemOption>
                </IonItemOptions>

                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    expandable={true}
                    onClick={() => panelDeleteAction.openConfirmation(panel)}
                  >
                    <IonIcon slot="icon-only" icon={icons.trashOutline}/>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            )
          })}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
          <IonFabButton color="primary" onClick={() => handleOpenPanelModal()}>
            <IonIcon icon={icons.add}/>
          </IonFabButton>
        </IonFab>
      </>)}

      <IonActionSheet
        isOpen={duplicateAction.isOpen}
        header={`Duplicate Panel ${duplicateAction.selectedItem?.ordinal}?`}
        subHeader="This will make a copy of this panel and its data"
        onDidDismiss={duplicateAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'selected', icon: icons.sparklesSharp, handler: duplicateAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: duplicateAction.dismiss },
        ]}
      />

      <IonActionSheet
        isOpen={panelDeleteAction.isOpen}
        header={`Delete Panel ${panelDeleteAction.selectedItem?.ordinal}?`}
        subHeader="This action cannot be undone."
        onDidDismiss={panelDeleteAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: panelDeleteAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: panelDeleteAction.dismiss },
        ]}
      />

      <PanelModal
        isOpen={isPanelModalOpen}
        initialData={selectedPanel}
        jobInstance={window.job}
        onDismiss={() => setIsPanelModalOpen(false)}
        onSave={handleSavePanel}
      />

      {activeTab === 'extras' && (
        <>
          <IonList ref={listRef} lines="full" className="ion-no-padding">
            {extras.map(extra => {
              return (
                <IonItemSliding key={extra.id}>
                  <IonItem button detail={true} onClick={() => handleOpenExtraModal(extra)}>
                    <IonLabel>
                      <h2>{extra.option}</h2>
                      <p>Quantity: {extra.quantity}</p>
                    </IonLabel>


                    <div slot="end" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <IonNote color="dark" style={{ fontSize: '1.1rem' }} className="ion-margin-end">
                        ${extra.totalCost.toFixed(2)}
                      </IonNote>
                    </div>
                  </IonItem>

                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => extraDeleteAction.openConfirmation(extra)}>
                      <IonIcon slot="icon-only" icon={icons.trashOutline}/>
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>

              )
            })}
          </IonList>

          <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
            <IonFabButton color="primary" onClick={() => handleOpenExtraModal()}>
              <IonIcon icon={icons.add}/>
            </IonFabButton>
          </IonFab>
        </>
      )}

      <IonActionSheet
        isOpen={extraDeleteAction.isOpen}
        header={`Delete window extra ${extraDeleteAction.selectedItem?.option}?`}
        onDidDismiss={extraDeleteAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'selected', icon: icons.createOutline, handler: extraDeleteAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: extraDeleteAction.dismiss },
        ]}
      />

      <WindowExtraModal
        isOpen={isExtraModalOpen}
        initialData={selectedExtra}
        jobInstance={window.job}
        onDismiss={() => setIsExtraModalOpen(false)}
        onSave={handleSaveExtra}
      />

    </>
  );
}

const panelSchema = z.object({
  width: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  height: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  center: z.coerce.number().min(0, "Must be greater than or equal to 0"),
  styleType: z.enum(styleTypes.map(v => v.name)),
  safetyType: z.enum(safetyOptions.map(v => v.name)),
  glassType: z.enum(glassTypes.map(v => v.name)),
});

type PanelFormData = z.infer<typeof panelSchema>;

interface PanelModalProps {
  isOpen: boolean;
  initialData: PanelWithOrdinal | null;
  jobInstance: Job;
  onDismiss: () => void;
  onSave: (data: PanelFormData) => void;
}

export function PanelModal({ isOpen, initialData, jobInstance, onDismiss, onSave }: PanelModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<PanelFormData>({
    resolver: zodResolver(panelSchema) as any,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset(initialData);
    } else {
      reset({
        width: 0,
        height: 0,
        center: 0,
        styleType: styleTypes[0].name,
        safetyType: safetyOptions[0].name,
        glassType: glassTypes[0].name,
      });
    }
  }, [isOpen, initialData, reset]);

  const [
    width,
    height,
    center,
    selectedStyleTypeName,
    selectedSafetyTypeName,
    selectedGlassTypeName
  ] = useWatch({
    control,
    name: ['width', 'height', 'center', 'styleType', 'safetyType', 'glassType']
  });

  const glassCost = calcGlassCost(width, height, center, selectedSafetyTypeName, selectedGlassTypeName);
  const { dgHour, dgCost, evsCost, evsHour } = calcPanelLabourHoursAndCosts(width, height, center, selectedStyleTypeName, jobInstance);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={0.55}
      breakpoints={[0, 0.55]}
    >
      <IonContent className="ion-padding">
        <div className="ion-display-flex ion-justify-content-between ion-align-items-center ion-margin-bottom">
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{initialData ? `Edit Panel ${initialData.ordinal}` : 'Add New Panel'}</h2>
          <IonButton fill="clear" color="medium" className="ion-no-margin" onClick={onDismiss}>
            <IonIcon icon={icons.close}/>
          </IonButton>
        </div>


        <form onSubmit={handleSubmit((data) => {
          onSave(data);
          onDismiss();
        })}>
          <div className="ion-display-flex ion-margin-bottom" style={{ gap: '8px' }}>
            <Controller
              name="width"
              control={control}
              render={({ field }) => (
                <div style={{ flex: 1 }}>
                  <NumberInput
                    label="Width"
                    errorText={errors.width?.message}
                    showValidation={!!errors.width}
                    className="ion-text-center"
                    {...field}
                  />
                </div>
              )}
            />
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <div style={{ flex: 1 }}>
                  <NumberInput
                    label="Height"
                    errorText={errors.height?.message}
                    showValidation={!!errors.height}
                    className="ion-text-center"
                    {...field}
                  />
                </div>
              )}
            />
            <Controller
              name="center"
              control={control}
              render={({ field }) => (
                <div style={{ flex: 1 }}>
                  <NumberInput
                    label="Center"
                    errorText={errors.center?.message}
                    showValidation={!!errors.center}
                    className="ion-text-center"
                    last
                    {...field}
                  />
                </div>
              )}
            />
          </div>

          <Controller
            name="styleType"
            control={control}
            render={({ field }) => (
              <IonSelect
                label="Style Type"
                labelPlacement="stacked"
                value={field.value}
                onIonChange={(e) => field.onChange(e.detail.value)}
                errorText={errors.styleType?.message}
                className={`${errors.styleType ? 'ion-invalid ion-touched' : ''}`}
              >
                {styleTypes.map((v) => (
                  <IonSelectOption key={v.name} value={v.name}>
                    {v.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            )}
          />

          <Controller
            name="safetyType"
            control={control}
            render={({ field }) => (
              <IonSelect
                label="Safety Option"
                labelPlacement="stacked"
                value={field.value}
                onIonChange={(e) => field.onChange(e.detail.value)}
                errorText={errors.safetyType?.message}
                className={`${errors.safetyType ? 'ion-invalid ion-touched' : ''}`}
              >
                {safetyOptions.map((v) => (
                  <IonSelectOption key={v.name} value={v.name}>
                    {v.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            )}
          />

          <Controller
            name="glassType"
            control={control}
            render={({ field }) => (
              <IonSelect
                label="Glass Type"
                labelPlacement="stacked"
                value={field.value}
                onIonChange={(e) => field.onChange(e.detail.value)}
                errorText={errors.glassType?.message}
                className={`ion-margin-bottom ${errors.glassType ? 'ion-invalid ion-touched' : ''}`}
              >
                {glassTypes.map((v) => (
                  <IonSelectOption key={v.name} value={v.name}>
                    {v.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            )}
          />

          <div className="ion-display-flex ion-justify-content-between" style={{ padding: '4px 0' }}>
            <span>Glass Cost</span>
            <span style={{ fontWeight: 'bold' }}>${glassCost.toFixed(2)}</span>
          </div>

          <IonItemDivider style={{ minHeight: '1px', padding: 0, margin: '16px 0' }}/>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '4px 0' }}>
            <span>DG Labour</span>
            <span style={{ textAlign: 'right' }}>{dgHour.toFixed(2)}hr</span>
            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>${dgCost.toFixed(2)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '4px 0' }}>
            <span>EVS Labour</span>
            <span style={{ textAlign: 'right' }}>{evsHour.toFixed(2)}hr</span>
            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>${evsCost.toFixed(2)}</span>
          </div>


          <IonButton type="submit" expand="block" className="ion-margin-top">
            {initialData ? 'Update Panel' : 'Create Panel'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
}

const windowExtraSchema = z.object({
  option: z.enum(extrasOptions.map(v => v.name)),
  quantity: z.coerce.number().min(1, "Minimum 1"),
});

type WindowExtraFormData = z.infer<typeof windowExtraSchema>;

interface WindowExtraModalProps {
  isOpen: boolean;
  initialData: WindowExtra | null;
  jobInstance: Job;
  onDismiss: () => void;
  onSave: (data: WindowExtraFormData) => void;
}

export function WindowExtraModal({ isOpen, initialData, jobInstance, onDismiss, onSave }: WindowExtraModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<WindowExtraFormData>({
    resolver: zodResolver(windowExtraSchema) as any,
  });

  const [selectedOptionName, quantity] = useWatch({
    control,
    name: ['option', 'quantity']
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialData ?? { option: extrasOptions[0].name, quantity: 1 });
    }
  }, [isOpen, initialData, reset]);

  const { unitCost, labourCost, totalCost } = calcWindowExtraCosts(selectedOptionName, quantity, jobInstance);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={0.45}
      breakpoints={[0, 0.45]}
    >
      <IonContent className="ion-padding">
        <div className="ion-display-flex ion-justify-content-between ion-align-items-center ion-margin-bottom">
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{initialData ? 'Edit Extra' : 'Add Extra'}</h2>
          <IonButton fill="clear" color="medium" className="ion-no-margin" onClick={onDismiss}><IonIcon icon={icons.close}/></IonButton>
        </div>

        <form onSubmit={handleSubmit((data) => {
          onSave(data);
          onDismiss();
        })}>
          <Controller
            name="option"
            control={control}
            render={({ field }) => (
              <IonSelect
                label="Option"
                labelPlacement="stacked"
                value={field.value}
                onIonChange={(e) => field.onChange(e.detail.value)}
                errorText={errors.option?.message}
                className={`ion-margin-bottom ${errors.option ? 'ion-invalid ion-touched' : ''}`}
              >
                {extrasOptions.map((v) => (
                  <IonSelectOption key={v.name} value={v.name}>
                    {v.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            )}
          />

          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <NumberInput
                label="Quantity"
                errorText={errors.quantity?.message}
                showValidation={!!errors.quantity}
                className="ion-text-center ion-margin-bottom"
                {...field}
              />
            )}
          />

          <div className="ion-margin-bottom">
            <div className="ion-display-flex ion-justify-content-between" style={{ padding: '4px 0' }}>
              <span>Materials</span>
              <span style={{ fontWeight: 'bold' }}>${unitCost.toFixed(2)}</span>
            </div>
            <div className="ion-display-flex ion-justify-content-between" style={{ padding: '4px 0' }}>
              <span>Labour </span>
              <span style={{ fontWeight: 'bold' }}>${labourCost.toFixed(2)}</span>
            </div>
          </div>

          <IonItemDivider style={{ minHeight: '1px', padding: 0, margin: '16px 0' }}/>

          <div className="ion-display-flex ion-justify-content-between" style={{ padding: '4px 0' }}>
            <span>Total Cost</span>
            <span style={{ fontWeight: 'bold' }}>${totalCost.toFixed(2)}</span>
          </div>

          <IonButton type="submit" expand="block" className="ion-margin-top">
            {initialData ? 'Update' : 'Add Extra'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
}