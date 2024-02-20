import { useCallback, useState } from "react";
import { t } from "ttag";

import type { IconName } from "metabase/ui";
import { Button, Icon } from "metabase/ui";
import type { SearchResult } from "metabase-types/api";

import { CollectionPicker } from "../../SpecificEntityPickers/CollectionPicker";
import type { EntityPickerOptions, PickerItem } from "../../types";
import { EntityPickerModal, defaultOptions } from "../EntityPickerModal";
import { NewCollectionDialog } from "../EntityPickerModal/NewCollectionDialog";

interface CollectionPickerModalProps {
  title: string;
  onChange: (item: PickerItem) => void;
  onClose: () => void;
  options: EntityPickerOptions;
  value: Pick<PickerItem, "id" | "model">;
}

export const CollectionPickerModal = ({
  title = t`Choose a collection`,
  onChange,
  onClose,
  value,
  options = defaultOptions,
}: CollectionPickerModalProps) => {
  const [selectedItem, setSelectedItem] = useState<PickerItem | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const searchFilter = useCallback(
    searchResults =>
      searchResults.filter((result: SearchResult) => result.can_write),
    [],
  );

  const handleItemSelect = useCallback(
    (item: PickerItem) => {
      if (options.hasConfirmButtons) {
        setSelectedItem(item);
      } else {
        onChange(item);
      }
    },
    [onChange, options],
  );

  const handleConfirm = () => {
    if (selectedItem) {
      onChange(selectedItem);
    }
  };

  const modalActions = [
    <Button
      key="collection-on-the-go"
      onClick={() => setCreateDialogOpen(true)}
      leftIcon={<Icon name="add" />}
      disabled={selectedItem?.can_write === false}
    >
      {t`Create a new collection`}
    </Button>,
  ];

  const tabs = [
    {
      displayName: t`Collections`,
      model: "collection",
      icon: "folder" as IconName,
      element: (
        <CollectionPicker
          onItemSelect={handleItemSelect}
          initialValue={value}
          options={options}
        />
      ),
    },
  ];

  return (
    <>
      <EntityPickerModal
        title={title}
        onItemSelect={handleItemSelect}
        onConfirm={handleConfirm}
        onClose={onClose}
        selectedItem={selectedItem}
        tabs={tabs}
        options={options}
        searchResultFilter={searchFilter}
        actions={modalActions}
        trapFocus={!createDialogOpen}
      />
      <NewCollectionDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        parentCollectionId={selectedItem?.id || value?.id || "root"}
      />
    </>
  );
};
