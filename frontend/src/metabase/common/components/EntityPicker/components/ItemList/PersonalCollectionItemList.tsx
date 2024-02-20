import { useMemo } from "react";

import { useCollectionListQuery } from "metabase/common/hooks";
import type { Collection } from "metabase-types/api";

import type { EntityPickerOptions, PickerItem } from "../../types";

import { ItemList } from "./ItemList";

interface PersonalCollectionsItemListProps {
  onClick: (val: PickerItem) => void;
  selectedItem: PickerItem | null;
  folderModel: string;
  options: EntityPickerOptions;
}

export const PersonalCollectionsItemList = ({
  onClick,
  selectedItem,
  folderModel,
}: PersonalCollectionsItemListProps) => {
  const { data: collections, isLoading } = useCollectionListQuery({
    query: { "personal-only": true },
  });

  const topLevelPersonalCollections = useMemo(
    () => getSortedTopLevelPersonalCollections(collections) as PickerItem[],
    [collections],
  );

  return (
    <ItemList
      items={topLevelPersonalCollections}
      isLoading={isLoading}
      onClick={onClick}
      selectedItem={selectedItem}
      folderModel={folderModel}
    />
  );
};

const getSortedTopLevelPersonalCollections = (
  personalCollections?: Collection[],
) =>
  personalCollections
    ?.filter(isRootPersonalCollection)
    .map((collection: Collection) => ({
      ...collection,
      model: "collection",
    }))
    .sort((a, b) => a?.name.localeCompare(b.name)) ?? [];

const isRootPersonalCollection = (collection: Collection) =>
  collection.is_personal && collection.location === "/";
