import { useField } from "formik";
import type { HTMLAttributes } from "react";
import { useState, useRef, useMemo, useCallback } from "react";
import { t } from "ttag";

import { isValidCollectionId } from "metabase/collections/utils";
import TippyPopoverWithTrigger from "metabase/components/PopoverWithTrigger/TippyPopoverWithTrigger";
import CollectionName from "metabase/containers/CollectionName";
import { CreateCollectionOnTheGoButton } from "metabase/containers/CreateCollectionOnTheGo";
import type { FilterItemsInPersonalCollection } from "metabase/containers/ItemPicker";
import SnippetCollectionName from "metabase/containers/SnippetCollectionName";
import FormField from "metabase/core/components/FormField";
import Collections from "metabase/entities/collections";
import SnippetCollections from "metabase/entities/snippet-collections";
import { useUniqueId } from "metabase/hooks/use-unique-id";
import { useSelector } from "metabase/lib/redux";
import type { CollectionId } from "metabase-types/api";

import {
  PopoverItemPicker,
  MIN_POPOVER_WIDTH,
} from "./FormCollectionPicker.styled";

export interface FormCollectionPickerProps
  extends HTMLAttributes<HTMLDivElement> {
  name: string;
  title?: string;
  placeholder?: string;
  type?: "collections" | "snippet-collections";
  initialOpenCollectionId?: CollectionId;
  onOpenCollectionChange?: (collectionId: CollectionId) => void;
  filterPersonalCollections?: FilterItemsInPersonalCollection;
}

function ItemName({
  id,
  type = "collections",
}: {
  id: CollectionId;
  type?: "collections" | "snippet-collections";
}) {
  return type === "snippet-collections" ? (
    <SnippetCollectionName id={id} />
  ) : (
    <CollectionName id={id} />
  );
}

function FormCollectionPicker({
  className,
  style,
  name,
  title,
  placeholder = t`Select a collection`,
  type = "collections",
  filterPersonalCollections,
}: FormCollectionPickerProps) {
  const id = useUniqueId();
  const [{ value }, { error, touched }, { setValue }] = useField(name);
  const formFieldRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [openCollectionId] = useState<CollectionId>("root");

  const openCollection = useSelector(state =>
    Collections.selectors.getObject(state, {
      entityId: openCollectionId,
    }),
  );

  const isOpenCollectionInPersonalCollection = openCollection?.is_personal;
  const showCreateNewCollectionOption =
    filterPersonalCollections !== "only" ||
    isOpenCollectionInPersonalCollection;

  // Search API doesn't support collection namespaces yet
  const hasSearch = type === "collections";
  const isSnippetCollection = type === "snippet-collections";

  const options = useMemo<EntityPickerModalOptions>(
    () => ({
      showPersonalCollections: filterPersonalCollections !== "exclude",
      showRootCollection: filterPersonalCollections !== "only",
      showSearch: hasSearch,
      hasConfirmButtons: true,
      namespace: isSnippetCollection ? "snippets" : undefined,
      allowCreateNew: showCreateNewCollectionOption,
    }),
    [
      filterPersonalCollections,
      hasSearch,
      isSnippetCollection,
      showCreateNewCollectionOption,
    ],
  );

  const handleChange = useCallback(
    ({ id }) => {
      setValue(canonicalCollectionId(id));
      setIsPickerOpen(false);
    },
    [setValue],
  );

  return (
    <>
      <FormField
        className={className}
        style={style}
        title={title}
        htmlFor={id}
        error={touched ? error : undefined}
        ref={formFieldRef}
      >
        <Button
          data-testid="collection-picker-button"
          id={id}
          onClick={() => setIsPickerOpen(true)}
          fullWidth
          rightIcon={<Icon name="ellipsis" />}
          styles={{
            inner: {
              justifyContent: "space-between",
            },
            root: { "&:active": { transform: "none" } },
          }}
        >
          {isValidCollectionId(value) ? (
            <ItemName id={value} type={type} />
          ) : (
            placeholder
          )}
        </Button>
      </FormField>
      {isPickerOpen && (
        <CollectionPickerModal
          title={t`Select a collection`}
          value={{ id: value, model: "collection" }}
          onChange={handleChange}
          onClose={() => setIsPickerOpen(false)}
          options={options}
        />
      )}
    </>
  );
}

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default FormCollectionPicker;
