import { TopBar } from "@src/components/TopBar.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getWindow, type WindowWithCount } from '@src/db/queries/window.ts';
import { deletePanel, getPanels, duplicatePanel, type PanelWithOrdinal, createPanel } from '@src/db/queries/panel.ts';
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
import { useItemConfirmation, useSimpleConfirmation } from '@src/hooks/useConfirmation.ts';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { NumberInput } from '@src/components/form/Input.tsx';
import extrasOptions from '@src/db/lookups/extras-options.ts';
import { useToast } from '@src/hooks/useToast.tsx';
import { Job } from '@src/db/queries/job.ts';

export default function Detail() {
  const { windowId } = useParams<{ windowId: string }>();
  const navigate = useNavigate();
  const { Toast } = useToast();
  const [window, setWindow] = useState<WindowWithCount | null>();
  const [panels, setPanels] = useState<PanelWithOrdinal[]>([]);
  const [extras, setExtras] = useState<WindowExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLIonListElement>(null);
  const [activeTab, setActiveTab] = useState<'panels' | 'extras'>('panels');
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

  const panelCreationAction = useSimpleConfirmation(async () => {
    if (!window) return;

    try {
      await createPanel(window);
      void refreshPanelList();
    } catch (error) {
      Toast.error('Failed to create panel');
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

  const handleOpenExtraModal = (extra?: WindowExtra) => {
    setSelectedExtra(extra || null);
    setIsExtraModalOpen(true);
  };

  const handleSaveExtra = async (data: WindowExtraFormData) => {
    const option = extrasOptions.find(o => o.name === data.option);
    const hourlyRate = window?.job?.hourlyRate ?? 0;

    const unitMat = option?.value ?? 0;
    const unitLab = (option?.hours ?? 0) * hourlyRate;
    const calculatedTotal = (unitMat + unitLab) * data.quantity;


    if (selectedExtra) {
      // Edit existing
      await updateWindowExtra(selectedExtra.id, {
        option: data.option,
        quantity: data.quantity,
        totalCost: calculatedTotal
      });
    } else {
      // Create new
      await createWindowExtra({
        windowId: windowIdNumber,
        option: data.option,
        quantity: data.quantity,
        totalCost: calculatedTotal
      });
    }

    // Refresh data
    const updatedExtras = await getWindowExtras(windowIdNumber);
    setExtras(updatedExtras);
  };

  return (
    <>
      <TopBar.Title text={`${window.displayText}`}/>

      <IonSegment
        value={activeTab}
        onIonChange={(e) => setActiveTab(e.detail.value as any)}
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
                <IonItem button detail={true} onClick={() => navigate(`/panel/${panel.id}`)}>
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

                  <div slot="end" style={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                    <IonNote color="dark" style={{fontSize: '1.1rem'}} className="ion-margin-end">
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
          <IonFabButton color="primary" onClick={() => panelCreationAction.openConfirmation()}>
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

      <IonActionSheet
        isOpen={panelCreationAction.isOpen}
        header={`Create Panel?`}
        onDidDismiss={panelCreationAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'selected', icon: icons.createOutline, handler: panelCreationAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: panelCreationAction.dismiss },
        ]}
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


                    <div slot="end" style={{ display: 'flex', alignItems: 'center', height: '100%'}}>
                      <IonNote color="dark" style={{fontSize: '1.1rem'}} className="ion-margin-end">
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

      <WindowExtraCreationModal
        isOpen={isExtraModalOpen}
        initialData={selectedExtra}
        jobInstance={window.job}
        onDismiss={() => setIsExtraModalOpen(false)}
        onSave={handleSaveExtra}
      />

    </>
  );
}

const windowExtraSchema = z.object({
  option: z.enum(extrasOptions.map(v => v.name)),
  quantity: z.coerce.number().min(1, "Minimum 1"),
});

type WindowExtraFormData = z.infer<typeof windowExtraSchema>;

interface ModalProps {
  isOpen: boolean;
  initialData: WindowExtra | null;
  jobInstance: Job;
  onDismiss: () => void;
  onSave: (data: WindowExtraFormData) => void;
}

export function WindowExtraCreationModal({ isOpen, initialData, jobInstance, onDismiss, onSave }: ModalProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<WindowExtraFormData>({
    resolver: zodResolver(windowExtraSchema) as any,
  });

  const [selectedOptionName, quantity] = useWatch({
    control,
    name: ['option', 'quantity']
  });

  const currentOption = extrasOptions.find(o => o.name === selectedOptionName);

  useEffect(() => {
    if (isOpen) {
      reset(initialData ?? { option: extrasOptions[0].name, quantity: 1 });
    }
  }, [isOpen, initialData, reset]);

  const unitCost = currentOption ? currentOption.value : 0;
  const labourCost = currentOption ? currentOption.hours * jobInstance?.hourlyRate : 0;
  const totalCost = (unitCost + labourCost) * (Number(quantity) || 0);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      initialBreakpoint={0.45}
      breakpoints={[0, 0.45]}
    >
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <div className="ion-margin-bottom">
                <IonSelect
                  label="Option"
                  labelPlacement="stacked"
                  value={field.value}
                  onIonChange={(e) => field.onChange(e.detail.value)}
                  errorText={errors.option?.message}
                  className={`${errors.option ? 'ion-invalid ion-touched' : ''}`}
                >
                  {extrasOptions.map((v) => (
                    <IonSelectOption key={v.name} value={v.name}>
                      {v.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Materials:</span>
              <span>${unitCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Labour:</span>
              <span>${labourCost.toFixed(2)}</span>
            </div>
          </div>

          <IonItemDivider style={{ minHeight: '1px', padding: 0, margin: '16px 0' }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <strong style={{ fontSize: '1.1rem' }}>Total Cost</strong>
            <strong style={{ fontSize: '1.1rem' }}>${totalCost.toFixed(2)}</strong>
          </div>

          <IonButton type="submit" expand="block" className="ion-margin-top">
            {initialData ? 'Update' : 'Add Extra'}
          </IonButton>
        </form>
      </IonContent>
    </IonModal>
  );
}