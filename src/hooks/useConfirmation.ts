import { useState } from 'react';

interface Identifier {
  id: number;
}

export function useConfirmation<T extends Identifier>(
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