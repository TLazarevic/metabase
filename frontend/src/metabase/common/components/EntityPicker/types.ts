import type { IconName } from "metabase/ui";
import type { SearchResult, SearchListQuery } from "metabase-types/api";

import type { CollectionPickerOptions } from "./SpecificEntityPickers/CollectionPicker";
import type { EntityPickerModalOptions } from "./components/EntityPickerModal";

export type TypeWithModel = {
  id: any;
  name: string;
  model: string;
};

export const isFolder = <
  TFolder extends TypeWithModel,
  TItem extends TypeWithModel,
>(
  item: TFolder | TItem,
  folderModel: string,
): item is TFolder => folderModel.includes(item.model);

export type PickerState<T> = PickerStateItem<T>[];

export type PickerStateItem<T> = EntityPickerStateItem<T>;

type EntityPickerStateItem<T> = {
  query?: SearchListQuery;
  selectedItem: T | any | null;
};

export type EntityPickerOptions = EntityPickerModalOptions &
  CollectionPickerOptions;

export type PickerItem = Pick<
  SearchResult,
  "id" | "name" | "description" | "can_write" | "model"
> & { location?: string };

export type EntityTab = {
  element: JSX.Element;
  displayName: string;
  model: string;
  icon: IconName;
};
