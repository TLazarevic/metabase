import { hasPremiumFeature } from "metabase-enterprise/settings";
import { PLUGIN_LLM_AUTODESCRIPTION } from "metabase/plugins";

import { LLMSuggestQuestionInfo } from "./LLMSuggestQuestionInfo";

if (hasPremiumFeature("llm_autodescription")) {
  PLUGIN_LLM_AUTODESCRIPTION.LLMSuggestQuestionInfo = LLMSuggestQuestionInfo;
}
