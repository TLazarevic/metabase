import { useSearchListQuery } from "metabase/common/hooks";

import type { TypeWithModel } from "../../types";

import { ItemList } from "./ItemList";

export interface EntityItemListProps<
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
> {
  query: any;
  onClick: (val: any) => void;
  selectedItem: TItem | TFolder | null;
  folderModel: string;
}

export const EntityItemList = <
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
>({
  query,
  onClick,
  selectedItem,
  folderModel,
}: EntityItemListProps<TItem, TFolder>) => {
  const { data, isLoading } = useSearchListQuery<TItem | TFolder>({ query });

  return (
    <ItemList
      items={data}
      isLoading={isLoading}
      onClick={onClick}
      selectedItem={selectedItem}
      folderModel={folderModel}
    />
  );
};
