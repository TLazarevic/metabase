import { useSearchListQuery } from "metabase/common/hooks";
import { ItemList } from "./ItemList";

export interface EntityItemListProps<TItem> {
  query: any;
  onClick: (val: any) => void;
  selectedItem: TItem | null;
  folderModel: string;
}

export const EntityItemList = <TItem,>({
  query,
  onClick,
  selectedItem,
  folderModel,
}: EntityItemListProps<TItem>) => {
  const { data, isLoading } = useSearchListQuery<TItem>({ query });

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
