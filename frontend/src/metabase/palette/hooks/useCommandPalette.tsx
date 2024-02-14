import { jt, t } from "ttag";
import _ from "underscore";
// import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo, useEffect } from "react";
import { push } from "react-router-redux";
import type { Action as PaletteAction } from "kbar";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { setOpenModal, closeModal } from "metabase/redux/ui";
import * as Urls from "metabase/lib/urls";
import { Icon } from "metabase/ui";
import { getContextualPaletteActions } from "metabase/selectors/palette";
import { getSections } from "metabase/admin/settings/selectors";
import { reloadSettings } from "metabase/admin/settings/settings";
import { useSearchListQuery } from "metabase/common/hooks";
import type { SearchResult } from "metabase-types/api";
import { DEFAULT_SEARCH_LIMIT } from "metabase/lib/constants";
import Search from "metabase/entities/search";
import { ItemIcon } from "metabase/search/components/SearchResult";
import type { WrappedResult } from "metabase/search/types";
// import { setPaletteQuery } from "metabase/redux/palette";

// // migrating to cmdk
// export type CommandPaletteAction = Omit<JsonStructureItem, "onclick" | "id"> & {
//   id?: string;
//   onSelect?: (value?: string) => void;
// };
// export type CommandPaletteActions = {
//   id: string;
//   heading?: string;
//   items: CommandPaletteAction[];
// }[];

export type { PaletteAction };

export type PalettePageId = "root" | "admin_settings";

type AdminSetting = {
  key: string;
  display_name: string;
  description: string | null;
  type?: "string";
  path: string;
};

export const useCommandPalette = ({
  search,
  debouncedSearchText,
}: // setPages,
{
  search: string;
  debouncedSearchText: string;
  // setPages: Dispatch<SetStateAction<PalettePageId[]>>;
}) => {
  const dispatch = useDispatch();
  const adminSections =
    useSelector<Record<string, { name: string; settings: AdminSetting[] }>>(
      getSections,
    );

  // const setPage = useCallback(
  //   (page: PalettePageId) => {
  //     setPages(pages => [...pages.slice(0, -1), page]);
  //   },
  //   [setPages],
  // );

  useEffect(() => {
    dispatch(reloadSettings());
  }, [dispatch]);

  const adminSectionsSearchMap = useMemo(() => {
    return Object.keys(adminSections).reduce<AdminSetting[]>((memo, key) => {
      const settings: AdminSetting[] = adminSections[key].settings || [];
      const path = `/admin/settings/${key}`;
      const acc: AdminSetting[] = [
        ...memo,
        ...settings
          .filter(s => s.display_name)
          .map(s => ({
            name: s.display_name || "",
            description: s.description,
            path,
            key: s.key,
            display_name: `${key[0].toUpperCase()}${key.slice(1)} / ${
              s.display_name
            }`,
          })),
      ];
      return acc;
    }, []);
  }, [adminSections]);

  const filteredAdmin = useMemo(() => {
    return adminSectionsSearchMap.filter(x =>
      x.display_name?.toLowerCase().includes(search?.toLowerCase() ?? ""),
    );
  }, [search, adminSectionsSearchMap]);

  const openNewModal = useCallback(
    (modalId: string) => {
      dispatch(closeModal());
      dispatch(setOpenModal(modalId));
    },
    [dispatch],
  );

  const contextualActions = useSelector(getContextualPaletteActions);

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearchLoading,
  } = useSearchListQuery<SearchResult>({
    enabled: !!debouncedSearchText,
    query: { q: debouncedSearchText, limit: DEFAULT_SEARCH_LIMIT },
    reload: true,
  });

  const rootPageActions = useMemo<PaletteAction[]>(() => {
    let actions: PaletteAction[] = [];
    if (contextualActions.length) {
      // for now, don't filter here because kbar uses useMatches()
      // actions = contextualActions.filter(({ name }) =>
      //   query ? name.toLowerCase().includes(query.toLowerCase()) : true,
      // );
      actions = contextualActions;
    }

    actions = [
      ...actions,
      {
        id: "new_collection",
        name: t`New collection`,
        icon: <Icon name="collection" />,
        perform: () => {
          openNewModal("collection");
        },
      },
      {
        id: "new_dashboard",
        name: t`New dashboard`,
        icon: <Icon name="dashboard" />,
        perform: () => {
          openNewModal("dashboard");
        },
      },
      {
        id: "new_question",
        name: t`New question`,
        icon: <Icon name="insight" />,
        perform: () => {
          dispatch(closeModal());
          dispatch(
            push(
              Urls.newQuestion({
                mode: "notebook",
                creationType: "custom_question",
              }),
            ),
          );
        },
      },
      {
        id: "admin_settings",
        name: t`Admin settings`,
        icon: <Icon name="gear" />,
      },
      {
        id: "search_docs",
        // TODO: Put query in a <strong> if possible
        name: search
          ? t`Search documentation for “${search}”`
          : t`View documentation`,
        keywords: search, // always match the query
        icon: <Icon name="reference" />,
        perform: () => {
          const host = "https://www.metabase.com";
          if (search) {
            const params = new URLSearchParams({ query: search });
            // TODO: find the documentation search URL in the right way
            window.open(`${host}/search?${params}`);
          } else {
            window.open(`${host}/docs/latest`);
          }
        },
      },
    ];
    // const filteredRootPageActions = filterItems(actions, search);
    // temporary fix for kbar issue
    const filteredRootPageActions = actions;

    let searchItems: PaletteAction[] = [];
    if (isSearchLoading) {
      searchItems.push({
        id: "search-is-loading",
        name: "Loading...",
        // TODO: Bring this jsx back if possible
        // children: <Loader size="sm" />,
        // perform: undefined, TODO: Is this needed?
      });
    } else if (searchError) {
      searchItems.push({
        id: "search-error",
        name: t`Could not load search results`,
      });
    } else if (debouncedSearchText && searchResults?.length === 0) {
      searchItems.push({
        id: "no-search-results",
        name: t`No results`,
      });
    } else if (debouncedSearchText && searchResults?.length) {
      searchItems = searchResults.map(result => {
        const wrappedResult: WrappedResult = Search.wrapEntity(
          result,
          dispatch,
        );
        return {
          id: `search-result-${result.id}`,
          name: result.name,
          icon: (
            <ItemIcon
              active={true}
              item={wrappedResult}
              type={wrappedResult.model}
            />
          ),
          perform: () => {
            dispatch(closeModal());
            dispatch(push(wrappedResult.getUrl()));
          },
        };
      });
    }
    if (searchItems.length) {
      filteredRootPageActions.push({
        id: "search_results",
        name: "Search results",
      });
      filteredRootPageActions.push(...searchItems);
    }
    return filteredRootPageActions;
  }, [
    search,
    dispatch,
    // setPage,
    openNewModal,
    contextualActions,
    searchResults,
    searchError,
    isSearchLoading,
    debouncedSearchText,
  ]);

  const adminSettingsActions: PaletteAction[] = useMemo(() => {
    return [
      ...filteredAdmin.map(s => ({
        parent: "admin_settings",
        id: s.display_name,
        name: s.display_name,
        keywords: s.display_name,
        icon: <Icon name="gear" />,
        perform: () => {
          dispatch(
            push({
              pathname: s.path,
              hash: `#${s.key}`,
            }),
          );
        },
      })),
    ];
  }, [filteredAdmin, dispatch]);

  return {
    rootPageActions,
    adminSettingsActions,
  };
};

// TODO: Simplify since we don't need to support nested actions
const childMatchesQuery = (child: React.ReactNode, query: string): boolean => {
  if (!child) {
    return false;
  }
  if (typeof child === "string") {
    return child.toLowerCase().includes(query?.toLowerCase() ?? "");
  }
  const children = Array.isArray(child) ? child : [child.toString()];
  return children.some(child => childMatchesQuery(child, query));
};

const filterItems = (
  actions: PaletteAction[],
  query: string,
): PaletteAction[] => {
  return actions.filter(item => {
    return childMatchesQuery(item.name, query);
  });
};
