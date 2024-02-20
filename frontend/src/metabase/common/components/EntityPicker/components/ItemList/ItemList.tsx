import { t } from "ttag";
import { Box, Text, NavLink, Loader, Center, Icon, Flex } from "metabase/ui";
import { VariableSizeItemsVirtualizedList } from "metabase/components/VirtualizedList";
import { CollectionEmptyIcon } from "metabase/collections/components/CollectionEmptyState/CollectionEmptyState";
import { color } from "metabase/lib/colors";
import { isFolder, type TypeWithModel } from "../../types";
import { getIcon, isSelectedItem } from "../../utils";
import { PickerColumn } from "./ItemList.styled";

interface ItemListProps<
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
> {
  items?: (TItem | TFolder)[];
  isLoading?: boolean;
  onClick: (val: TItem | TFolder) => void;
  selectedItem: TItem | TFolder | null;
  folderModel: string;
}

export const ItemList = <
  TItem extends TypeWithModel,
  TFolder extends TypeWithModel,
>({
  items,
  isLoading = false,
  onClick,
  selectedItem,
  folderModel,
}: ItemListProps<TItem, TFolder>) => {
  if (isLoading) {
    return (
      <Box miw={310} h="100%">
        <Center p="lg" h="100%">
          <Loader />
        </Center>
      </Box>
    );
  }

  if (!items) {
    return null;
  }

  if (!items.length) {
    return (
      <Flex justify="center" align="center" direction="column" h="100%">
        <CollectionEmptyIcon height={47} />
        <Text align="center" p="lg" fw={700} color={color("text-light")}>
          {t`No ${folderModel}s here`}
        </Text>
      </Flex>
    );
  }

  return (
    <VariableSizeItemsVirtualizedList Wrapper={PickerColumn}>
      {items.map((item: TItem | TFolder) => {
        const isFolderItem: boolean = isFolder<TItem, TFolder>(
          item,
          folderModel,
        );
        const isSelected = isSelectedItem(item, selectedItem);
        return (
          <div key={`${item.model ?? "collection"}-${item.id}`}>
            <NavLink
              rightSection={
                isFolderItem ? <Icon name="chevronright" size={10} /> : null
              }
              label={item.name}
              active={isSelected}
              icon={<Icon {...getIcon(item)} />}
              onClick={e => {
                e.preventDefault(); // prevent form submission
                e.stopPropagation(); // prevent parent onClick
                onClick(item);
              }}
              variant="light"
              mb="xs"
            />
          </div>
        );
      })}
    </VariableSizeItemsVirtualizedList>
  );
};
