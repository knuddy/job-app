import { useState } from 'react';

export function useSimpleConfirmation(onConfirm: () => Promise<void> | void) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openConfirmation = () => setIsOpen(true);
  const dismiss = () => setIsOpen(false);

  const executeAction = async () => {
    await onConfirm();
    dismiss();
  };

  return {
    openConfirmation,
    dismiss,
    executeAction,
    isOpen
  };
}

interface Identifier {
  id: number;
}

export function useItemConfirmation<T extends Identifier>(
  onConfirm: (item: T) => Promise<void> | void
) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openConfirmation = (item: T) => setSelectedItem(item);
  const dismiss = () => setSelectedItem(null);

  const executeAction = async () => {
    if (selectedItem) {
      await onConfirm(selectedItem);
      dismiss();
    }
  };

  return {
    selectedItem,
    openConfirmation,
    dismiss,
    executeAction,
    isOpen: selectedItem !== null
  };
}