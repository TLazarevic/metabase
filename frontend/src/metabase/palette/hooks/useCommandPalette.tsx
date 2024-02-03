import { jt, t } from "ttag";
import _ from "underscore";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo, useEffect } from "react";
import { push } from "react-router-redux";
import type { JsonStructureItem } from "react-cmdk";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { setOpenModal, closeModal } from "metabase/redux/ui";
import * as Urls from "metabase/lib/urls";
import { Icon, Loader } from "metabase/ui";
import { getContextualPaletteActions } from "metabase/selectors/palette";
import { getSections } from "metabase/admin/settings/selectors";
import { reloadSettings } from "metabase/admin/settings/settings";
import { useSearchListQuery } from "metabase/common/hooks";
import type { SearchResult } from "metabase-types/api";
import { DEFAULT_SEARCH_LIMIT } from "metabase/lib/constants";
import Search from "metabase/entities/search";
import { ItemIcon } from "metabase/search/components/SearchResult";
import type { WrappedResult } from "metabase/search/types";
import {setPaletteQuery} from "metabase/redux/palette";

// migrating to cmdk
export type CommandPaletteAction = Omit<JsonStructureItem, "onclick" | "id"> & {
  id?: string;
  onSelect?: (value?: string) => void;
};
export type CommandPaletteActions = {
  id: string;
  heading?: string;
  items: CommandPaletteAction[];
}[];

export type PalettePageId = "root" | "admin_settings";

type AdminSetting = {
  key: string;
  display_name: string;
  description: string | null;
  type: "string";
  path: string;
};

const childMatchesQuery = (child: React.ReactNode, query: string): boolean => {
  if (!child) {
    return false;
  }
  if (typeof child === "string") {
    return child.toLowerCase().includes(query.toLowerCase());
  }
  const children = Array.isArray(child) ? child : [child.toString()];
  return children.some(child => childMatchesQuery(child, query));
};

const filterItems = (
  actions: CommandPaletteActions,
  query: string,
): CommandPaletteActions => {
  return actions.map(action => {
    return {
      ...action,
      items: action.items.filter(item => {
        if (item.children) {
          return childMatchesQuery(item.children, query);
        }
      }),
    };
  });
};

export const useCommandPalette = ({
  query,
  debouncedSearchText,
  setPages,
}: {
  query: string;
  debouncedSearchText: string;
  setPages: Dispatch<SetStateAction<PalettePageId[]>>;
}) => {
  const dispatch = useDispatch();
  const adminSections = useSelector<Record<string, AdminSetting>>(getSections);

  const setPage = useCallback(
    (page: PalettePageId) => {
      setPages(pages => [...pages.slice(0, -1), page]);
    },
    [setPages],
  );

  useEffect(() => {
    dispatch(reloadSettings());
  }, [dispatch]);

  const adminSectionsSearchMap = useMemo(
    () =>
      Object.keys(adminSections).reduce<AdminSetting[]>((memo, key) => {
        const settings = adminSections[key].settings || [];
        const path = `/admin/settings/${key}`;

        return [
          ...memo,
          ...settings
            .filter(s => s.display_name)
            .map(s => ({
              name: s.display_name || "",
              description: s.description,
              path,
              key: s.key,
              displayName: `${key[0].toUpperCase()}${key.slice(1)} / ${
                s.display_name
              }`,
            })),
        ];
      }, []),
    [adminSections],
  );

  const filteredAdmin = useMemo(
    () =>
      adminSectionsSearchMap.filter(x =>
        x.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, adminSectionsSearchMap],
  );

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

  const rootPageActions = useMemo<CommandPaletteActions>(() => {
    let actions: CommandPaletteActions = [];
    if (contextualActions.length) {
      actions = [
        {
          id: "contextual_actions",
          heading: t`On this page`,
          items: contextualActions.filter(({ children }) =>
            query
              ? children?.toString().toLowerCase().includes(query.toLowerCase())
              : true,
          ),
        },
      ];
    }

    actions = [
      ...actions,
      {
        id: "new",
        heading: actions.length ? t`Other actions` : t`Actions`,
        items: [
          {
            id: "new_collection",
            children: t`New collection`,
            icon: () => <Icon name="collection" />,
            onSelect: () => {
              openNewModal("collection");
            },
          },
          {
            id: "new_dashboard",
            children: t`New dashboard`,
            icon: () => <Icon name="dashboard" />,
            onSelect: () => {
              openNewModal("dashboard");
            },
          },
          {
            id: "new_question",
            children: t`New question`,
            icon: () => <Icon name="insight" />,
            onSelect: () => {
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
            children: t`Admin settings`,
            icon: () => <Icon name="gear" />,
            closeOnSelect: false,
            onSelect: () => {
              dispatch(setPaletteQuery(""));
              setPage("admin_settings");
            },
          },
          {
            id: "search_docs",
            children: query
              ? jt`${(
                  <span>
                    Search documentation for&nbsp;
                    <strong>&ldquo;{query}&rdquo;</strong>
                  </span>
                )}`
              : t`Metabase documentation`,
            keywords: [query], // always match the query
            icon: () => <Icon name="reference" />,
            closeOnSelect: false,
            onSelect: () => {
              const host = "https://www.metabase.com";
              if (query) {
                const params = new URLSearchParams({ query });
                // TODO: find the documentation search URL in the right way
                window.open(`${host}/search?${params}`);
              } else {
                window.open(`${host}/docs/latest`);
              }
            },
          },
        ],
      },
    ];
    const filteredRootPageActions = filterItems(actions, query);

    let searchItems: CommandPaletteAction[] = [];
    if (isSearchLoading) {
      searchItems.push({
        id: "search-is-loading",
        children: <Loader size="sm" />,
        disabled: true,
      });
    } else if (searchError) {
      searchItems.push({
        id: "search-error",
        children: t`Could not load search results`,
        disabled: true,
      });
    } else if (debouncedSearchText && searchResults?.length === 0) {
      searchItems.push({
        id: "no-search-results",
        children: t`No results`,
        disabled: true,
      });
    } else if (debouncedSearchText && searchResults?.length) {
      searchItems = searchResults.map(result => {
        const wrappedResult: WrappedResult = Search.wrapEntity(
          result,
          dispatch,
        );
        return {
          id: `search-result-${result.id}`,
          children: result.name,
          icon: () => (
            <ItemIcon
              active={true}
              item={wrappedResult}
              type={wrappedResult.model}
            />
          ),
          onSelect: () => {
            dispatch(closeModal());
            dispatch(push(wrappedResult.getUrl()));
          },
        };
      });
    }
    if (searchItems.length) {
      filteredRootPageActions.push({
        id: "search_results",
        heading: t`Search results`,
        items: searchItems,
      });
    }
    return filteredRootPageActions;
  }, [
    query,
    dispatch,
    setPage,
    openNewModal,
    setQuery,
    contextualActions,
    searchResults,
    searchError,
    isSearchLoading,
    debouncedSearchText,
  ]);

  const adminSettingsActions = [
    {
      id: "admin_settings",
      heading: "Admin settings",
      items: [
        {
          id: "back",
          children: t`Back`,
          icon: () => <Icon name="arrow_left" />,
          closeOnSelect: false,
          onSelect: () => {
            setPage("root");
          },
        },
        ...filteredAdmin.map(s => ({
          id: s.display_name,
          children: s.display_name,
          icon: () => <Icon name="gear" />,
          onSelect: () =>
            dispatch(
              push({
                pathname: s.path,
                hash: `#${s.key}`,
              }),
            ),
        })),
      ],
    },
  ];

  return {
    rootPageActions,
    adminSettingsActions,
  };
};
