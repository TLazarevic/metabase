import { Flex } from "metabase/ui";
import { PERSONAL_COLLECTIONS } from "metabase/entities/collections";
import ErrorBoundary from "metabase/ErrorBoundary";
import { isFolder } from "../../types";
import type {
  EntityPickerOptions,
  TypeWithModel,
  PickerItem,
  PickerState,
} from "../../types";
import type { EntityItemListProps } from "../ItemList";
import {
  RootItemList,
  EntityItemList,
  PersonalCollectionsItemList,
} from "../ItemList";
import { ListBox } from "./NestedItemPicker.styled";
import { AutoScrollBox } from "./AutoScrollBox";

export interface NestedItemPickerProps<
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
> {
  onFolderSelect: ({ folder }: { folder: TFolder }) => void;
  onItemSelect: (item: TItem) => void;
  folderModel: string;
  itemModel: string;
  options: EntityPickerOptions;
  path: PickerState<TFolder>;
}

export function NestedItemPicker<
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
>({
  onFolderSelect,
  onItemSelect,
  folderModel,
  options,
  path,
}: NestedItemPickerProps<TItem, TFolder>) {
  const handleFolderSelect = (folder: TFolder) => {
    onFolderSelect({ folder });
  };

  const handleClick = (item: TItem | TFolder) => {
    if (isFolder(item, folderModel)) {
      handleFolderSelect(item as TFolder);
    } else {
      onItemSelect(item as TItem);
    }
  };

  return (
    <AutoScrollBox data-testid="nested-item-picker">
      <Flex h="100%" w="fit-content">
        {path.map((level, index) => {
          const { query, selectedItem } = level;

          return (
            <ListBox
              key={JSON.stringify(query ?? "root").slice(0, 255)}
              data-testid={`item-picker-level-${index}`}
            >
              <ErrorBoundary>
                <ListComponent
                  query={query}
                  selectedItem={selectedItem}
                  options={options}
                  onClick={(item: TItem | TFolder) => handleClick(item)}
                  folderModel={folderModel}
                />
              </ErrorBoundary>
            </ListBox>
          );
        })}
      </Flex>
    </AutoScrollBox>
  );
}

function ListComponent({
  onClick,
  selectedItem,
  folderModel,
  options,
  query,
}: EntityItemListProps<PickerItem> & { options: EntityPickerOptions }) {
  if (!query) {
    return (
      <RootItemList
        options={options}
        selectedItem={selectedItem}
        onClick={onClick}
        folderModel={folderModel}
      />
    );
  }

  if (query.collection === PERSONAL_COLLECTIONS.id) {
    return (
      <PersonalCollectionsItemList
        options={options}
        onClick={onClick}
        selectedItem={selectedItem}
        folderModel={folderModel}
      />
    );
  }

  return (
    <EntityItemList
      query={query}
      onClick={onClick}
      selectedItem={selectedItem}
      folderModel={folderModel}
    />
  );
}
