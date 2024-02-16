import { useState, useMemo } from "react";
import { t } from "ttag";

import { Modal } from "metabase/ui";
import ErrorBoundary from "metabase/ErrorBoundary";
import type { SearchResult } from "metabase-types/api";
import { useModalOpen } from "metabase/hooks/use-modal-open";

import type { EntityPickerOptions, EntityTab, PickerItem } from "../../types";
import { EntityPickerSearchInput } from "../EntityPickerSearch/EntityPickerSearch";

import { ButtonBar } from "./ButtonBar";
import { TabsView } from "./TabsView";
import { SinglePickerView } from "./SinglePickerView";
import { GrowFlex, ModalContent, ModalBody } from "./EntityPickerModal.styled";

export type EntityPickerModalOptions = {
  showPersonalCollection?: boolean;
  showRootCollection?: boolean;
  showSearch?: boolean;
  hasConfirmButtons?: boolean;
  allowCreateNew?: boolean;
};

export const defaultOptions: EntityPickerModalOptions = {
  showPersonalCollection: true,
  showRootCollection: true,
  showSearch: true,
  hasConfirmButtons: true,
  allowCreateNew: true,
};

export interface EntityPickerModalProps {
  title: string;
  selectedItem: PickerItem | null;
  onConfirm: () => void;
  onItemSelect: (item: PickerItem) => void;
  onClose: () => void;
  tabs: EntityTab[];
  options?: EntityPickerOptions;
  searchResultFilter?: (results: SearchResult[]) => SearchResult[];
  actions?: JSX.Element[];
  trapFocus?: boolean;
}

export function EntityPickerModal({
  title = t`Choose an item`,
  onItemSelect,
  onConfirm,
  selectedItem,
  onClose,
  tabs,
  options = defaultOptions,
  actions = [],
  searchResultFilter,
  trapFocus = true,
}: EntityPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );

  const { open } = useModalOpen();

  const hasTabs = tabs.length > 1 || searchQuery;
  const tabModels = useMemo(() => tabs.map(t => t.model), [tabs]);

  return (
    <Modal.Root
      opened={open}
      onClose={onClose}
      data-testid="entity-picker-modal"
      trapFocus={trapFocus}
    >
      <Modal.Overlay />
      <ModalContent h="100%">
        <Modal.Header px="1.5rem" pt="1rem" pb={hasTabs ? "1rem" : "1.5rem"}>
          <GrowFlex justify="space-between">
            <Modal.Title lh="2.5rem">{title}</Modal.Title>
            {options.showSearch && (
              <EntityPickerSearchInput
                models={tabModels}
                setSearchResults={setSearchResults}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchFilter={searchResultFilter}
              />
            )}
          </GrowFlex>
          <Modal.CloseButton
            size={21}
            style={{ position: "relative", top: "1px" }}
          />
        </Modal.Header>
        <ModalBody p="0">
          <ErrorBoundary>
            {hasTabs ? (
              <TabsView
                tabs={tabs}
                onItemSelect={onItemSelect}
                searchQuery={searchQuery}
                searchResults={searchResults}
                selectedItem={selectedItem}
              />
            ) : (
              <SinglePickerView tab={tabs[0]} />
            )}
            {!!options.hasConfirmButtons && (
              <ButtonBar
                onConfirm={onConfirm}
                onCancel={onClose}
                canConfirm={!!selectedItem && selectedItem?.can_write !== false}
                actions={actions}
              />
            )}
          </ErrorBoundary>
        </ModalBody>
      </ModalContent>
    </Modal.Root>
  );
}
