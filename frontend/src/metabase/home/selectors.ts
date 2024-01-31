import { createSelector } from "@reduxjs/toolkit";

import { getSetting } from "metabase/selectors/settings";
import { getUser } from "metabase/selectors/user";
import MetabaseSettings from "metabase/lib/settings";
import type { State } from "metabase-types/store";

export const getIsXrayEnabled = (state: State) => {
  return getSetting(state, "enable-xrays");
};

export const getIsMetabotEnabled = (state: State) => {
  return getSetting(state, "is-metabot-enabled");
};

export const getHasMetabotLogo = (state: State) => {
  return getSetting(state, "show-metabot");
};

export const getHasIllustration = (state: State) => {
  return getSetting(state, "show-lighthouse-illustration");
};

export const getCustomHomePageDashboardId = createSelector(
  [getUser],
  user => user?.custom_homepage?.dashboard_id || null,
);

export const getHasDismissedCustomHomePageToast = (state: State) => {
  return getSetting(state, "dismissed-custom-dashboard-toast");
};

export const getIsAutoDescriptionEnabled = (state: State) => {
  return (
    getSetting(state, "ee-openai-api-key")?.length !== 0 &&
    MetabaseSettings.isEnterprise()
  );
};
