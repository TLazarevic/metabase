import { useCallback, useState } from "react";
import { useDebounce } from "react-use";
import { push } from "react-router-redux";

import {
  KBarPortal,
  KBarProvider,
  KBarResults,
  useKBar,
  useMatches,
  useRegisterActions,
} from "kbar";

import { t } from "ttag/types";
import { SEARCH_DEBOUNCE_DURATION } from "metabase/lib/constants";
import { Flex, Icon, Text } from "metabase/ui";
import { color } from "metabase/lib/colors";
import * as Urls from "metabase/lib/urls";
import { useDispatch } from "metabase/lib/redux";
import { closeModal, setOpenModal } from "metabase/redux/ui";
import type { PaletteAction } from "../hooks/useCommandPalette";
import { useCommandPalette } from "../hooks/useCommandPalette";

import {
  PaletteFooterContainer,
  PaletteInput,
  PaletteModal,
  PaletteResult,
  PaletteResultList,
  PaletteResultsSectionHeader,
} from "./Palette.styled";

// TODO: Maybe scroll to the selected item in the palette when it's out of sight

const PaletteFooter = () => {
  return (
    <PaletteFooterContainer p=".5rem 1.33rem" gap="1.5rem">
      <Flex gap=".33rem">
        <Icon color={color("light")} name="sort" />
        <Text tt="uppercase" weight="bold" size="10px" color={color("medium")}>
          Select
        </Text>
      </Flex>
      <Flex gap=".33rem">
        <EnterIcon />
        <Text tt="uppercase" weight="bold" size="10px" color={color("medium")}>
          Open
        </Text>
      </Flex>
    </PaletteFooterContainer>
  );
};

const EnterIcon = ({
  fill = color("light"),
  active = true,
}: {
  fill?: string;
  active?: boolean;
}) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ visibility: active ? "visible" : "hidden" }}
  >
    <path
      d="M3.03377 10.25H4.10128H12C12.6904 10.25 13.25 9.69036 13.25 9V5C13.25 4.30964 12.6904 3.75 12 3.75H9.4C9.26193 3.75 9.15 3.86193 9.15 4C9.15 4.13807 9.26193 4.25 9.4 4.25H12C12.4143 4.25 12.75 4.58583 12.75 5V9C12.75 9.41417 12.4143 9.75 12 9.75H4.10128H3.03375L3.71717 8.92991L5.19205 7.16005C5.19205 7.16005 5.19206 7.16005 5.19206 7.16005C5.28045 7.05397 5.26611 6.89634 5.16005 6.80795L5.16004 6.80795C5.05398 6.71956 4.89634 6.73388 4.80794 6.83995L3.03377 10.25ZM3.03377 10.25L3.71716 11.0701L5.19205 12.84L5.19206 12.84C5.28043 12.946 5.26613 13.1037 5.16003 13.1921C5.05396 13.2804 4.89633 13.2661 4.80794 13.16C4.80794 13.16 4.80793 13.16 4.80793 13.16L2.30794 10.16L2.30792 10.16C2.23071 10.0673 2.23067 9.93269 2.30794 9.83995C2.30794 9.83995 2.30794 9.83995 2.30795 9.83994L4.80793 6.83996L3.03377 10.25Z"
      fill={fill}
      stroke={fill}
    />
  </svg>
);

/** Command palette */
export const Palette = () => {
  const dispatch = useDispatch();
  const openNewModal = useCallback(
    (modalId: string) => {
      dispatch(closeModal());
      dispatch(setOpenModal(modalId));
    },
    [dispatch],
  );

  const initialActions = [
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
    // TODO: Ensure this action gets replaced with query-based search when a search string is present
    {
      id: "search_docs",
      name: t`View documentation`,
      icon: <Icon name="reference" />,
      perform: () => {
        const host = "https://www.metabase.com";
        window.open(`${host}/docs/latest`);
      },
    },
  ];

  return (
    <KBarProvider actions={initialActions}>
      <KBarPortal>
        <PaletteModal>
          <PaletteInput defaultPlaceholder="Jump to..." />
          {/* TODO: Ensure that when there are no search results it says 'No results found' */}
          <PaletteResults />
          <PaletteFooter />
        </PaletteModal>
      </KBarPortal>
    </KBarProvider>
  );
};

export const PaletteResults = () => {
  const { search } = useKBar(state => ({ search: state.searchQuery }));
  const trimmedSearch = search.trim();

  const [debouncedSearchText, setDebouncedSearchText] = useState(search);

  useDebounce(
    () => {
      setDebouncedSearchText(trimmedSearch);
    },
    SEARCH_DEBOUNCE_DURATION,
    [search],
  );

  const actions = useCommandPalette({
    search: trimmedSearch,
    debouncedSearchText,
  });
  useRegisterActions(actions, actions);
  const actionIdToComponent = new Map<string, PaletteAction["component"]>();
  actions.forEach(action => {
    if (action.component) {
      actionIdToComponent.set(action.id, action.component);
    }
  });

  const { results } = useMatches();

  return (
    <PaletteResultList>
      <KBarResults
        items={results}
        onRender={({ item, active }) => {
          return (
            <PaletteResult active={active}>
              {typeof item === "string" ? (
                <PaletteResultsSectionHeader>
                  {item}
                </PaletteResultsSectionHeader>
              ) : (
                <Flex
                  p=".75rem"
                  w="100%"
                  align="center"
                  justify="space-between"
                >
                  <Flex gap=".5rem">
                    {item.icon || <Icon name="click" />}
                    {actionIdToComponent.get(item.id) ?? item.name}
                  </Flex>
                  <EnterIcon active={active} fill={color("brand")} />
                </Flex>
              )}
            </PaletteResult>
          );
        }}
      />
    </PaletteResultList>
  );
};
