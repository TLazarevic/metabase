import { jt, t } from "ttag";
// import type { Dispatch, SetStateAction } from "react";
import type { Action as KBarAction } from "kbar";
import { useEffect, useMemo } from "react";
import { push } from "react-router-redux";
import type { SearchResult } from "metabase-types/api";
import { getSections } from "metabase/admin/settings/selectors";
import { reloadSettings } from "metabase/admin/settings/settings";
import { useSearchListQuery } from "metabase/common/hooks";
import Search from "metabase/entities/search";
import { DEFAULT_SEARCH_LIMIT } from "metabase/lib/constants";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { closeModal } from "metabase/redux/ui";
import { getContextualPaletteActions } from "metabase/selectors/palette";
import { Icon, Loader } from "metabase/ui";
// import { setPaletteQuery } from "metabase/redux/palette";

export type PaletteAction = KBarAction & { component?: React.ReactNode };

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
}: {
  search: string;
  debouncedSearchText: string;
}) => {
  const dispatch = useDispatch();
  const adminSections =
    useSelector<Record<string, { name: string; settings: AdminSetting[] }>>(
      getSections,
    );

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

  // TODO: Determine whether kbar handles this filtering automatically
  const filteredAdmin = useMemo(() => {
    return adminSectionsSearchMap.filter(x =>
      x.display_name?.toLowerCase().includes(search?.toLowerCase() ?? ""),
    );
  }, [search, adminSectionsSearchMap]);

  const contextualActions: PaletteAction[] = useSelector(
    getContextualPaletteActions,
  ).map(action => ({ ...action, section: "On this page" }));

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearchLoading,
  } = useSearchListQuery<SearchResult>({
    enabled: debouncedSearchText.length > 0,
    query: { q: debouncedSearchText, limit: DEFAULT_SEARCH_LIMIT },
    reload: true,
  });

  const basicActions = useMemo<PaletteAction[]>(() => {
    const ret: PaletteAction[] = [
      {
        id: "search_docs",
        name: `Search documentation for “${search}”`,
        component: search
          ? // TODO: Why use these classNames here?
            jt`${(
              <span className="truncate max-w-md dark:text-white">
                Search documentation for&nbsp;
                <strong>&ldquo;{search}&rdquo;</strong>
              </span>
            )}`
          : t`View documentation`,
        keywords: search, // Always match the search string
        icon: () => <Icon name="document" />,
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
    return ret;
  }, [search]);

  const searchResultActions = useMemo<PaletteAction[]>(() => {
    const ret: PaletteAction[] = [];
    if (isSearchLoading) {
      ret.push({
        id: "search-is-loading",
        name: "Loading...",
        component: <Loader size="sm" />,
      });
    } else if (searchError) {
      ret.push({
        id: "search-error",
        name: t`Could not load search results`,
      });
    } else if (debouncedSearchText) {
      if (searchResults?.length) {
        ret.push(
          ...searchResults.map(result => {
            const wrappedResult = Search.wrapEntity(result, dispatch);
            return {
              id: `search-result-${result.id}`,
              name: result.name,
              icon: <Icon {...wrappedResult.getIcon()} />,
              section: "Search results",
              perform: () => {
                dispatch(closeModal());
                dispatch(push(wrappedResult.getUrl()));
              },
            };
          }),
        );
      } else {
        ret.push({
          id: "no-search-results",
          name: t`No results`,
        });
      }
    }
    return ret;
  }, [
    dispatch,
    debouncedSearchText,
    isSearchLoading,
    searchError,
    searchResults,
  ]);

  const adminSettingsActions: PaletteAction[] = useMemo(() => {
    return filteredAdmin.map(s => ({
      parent: "admin_settings",
      id: s.display_name,
      name: s.display_name,
      icon: <Icon name="gear" />,
      perform: () => {
        dispatch(
          push({
            pathname: s.path,
            hash: `#${s.key}`,
          }),
        );
      },
    }));
  }, [filteredAdmin, dispatch]);

  return [
    ...basicActions,
    ...searchResultActions,
    ...contextualActions,
    ...adminSettingsActions,
  ];
};
