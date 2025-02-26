import _ from "underscore";

import { isActionDashCard } from "metabase/actions/utils";
import { getExistingDashCards } from "metabase/dashboard/actions/utils";
import {
  isQuestionDashCard,
  isVirtualDashCard,
} from "metabase/dashboard/utils";
import { getParameterMappingOptions } from "metabase/parameters/utils/mapping-options";
import type Question from "metabase-lib/Question";
import type Metadata from "metabase-lib/metadata/Metadata";
import { compareMappingOptionTargets } from "metabase-lib/parameters/utils/targets";
import type {
  CardId,
  QuestionDashboardCard,
  DashboardId,
  DashboardParameterMapping,
  DashCardId,
  ParameterId,
  ParameterTarget,
} from "metabase-types/api";
import type { DashboardState } from "metabase-types/store";

export function getAllDashboardCardsWithUnmappedParameters({
  dashboardState,
  dashboardId,
  parameterId,
  excludeDashcardIds = [],
}: {
  dashboardState: DashboardState;
  dashboardId: DashboardId;
  parameterId: ParameterId;
  excludeDashcardIds?: DashCardId[];
}): QuestionDashboardCard[] {
  const dashCards = getExistingDashCards(
    dashboardState.dashboards,
    dashboardState.dashcards,
    dashboardId,
  );
  return dashCards.filter(
    (dashcard): dashcard is QuestionDashboardCard =>
      isQuestionDashCard(dashcard) &&
      !excludeDashcardIds.includes(dashcard.id) &&
      !dashcard.parameter_mappings?.some(
        mapping => mapping.parameter_id === parameterId,
      ),
  );
}

export function getMatchingParameterOption(
  targetDashcard: QuestionDashboardCard,
  targetDimension: ParameterTarget,
  sourceDashcard: QuestionDashboardCard,
  metadata: Metadata,
  questions: Record<CardId, Question>,
): {
  target: ParameterTarget;
} | null {
  if (!targetDashcard) {
    return null;
  }

  const sourceQuestion = questions[sourceDashcard.card.id];
  const targetQuestion = questions[targetDashcard.card.id];

  return (
    getParameterMappingOptions(
      targetQuestion,
      null,
      targetDashcard.card,
      targetDashcard,
    ).find((param: { target: ParameterTarget }) =>
      compareMappingOptionTargets(
        targetDimension,
        param.target,
        sourceQuestion,
        targetQuestion,
      ),
    ) ?? null
  );
}

export type DashCardAttribute = {
  id: DashCardId;
  attributes: {
    parameter_mappings: DashboardParameterMapping[];
  };
};

export function getAutoWiredMappingsForDashcards(
  sourceDashcard: QuestionDashboardCard,
  targetDashcards: QuestionDashboardCard[],
  parameter_id: ParameterId,
  target: ParameterTarget,
  metadata: Metadata,
  questions: Record<CardId, Question>,
): DashCardAttribute[] {
  if (targetDashcards.length === 0) {
    return [];
  }

  const targetDashcardMappings: DashCardAttribute[] = [];

  for (const targetDashcard of targetDashcards) {
    const selectedMappingOption: {
      target: ParameterTarget;
    } | null = getMatchingParameterOption(
      targetDashcard,
      target,
      sourceDashcard,
      metadata,
      questions,
    );

    if (selectedMappingOption && targetDashcard.card_id) {
      targetDashcardMappings.push({
        id: targetDashcard.id,
        attributes: {
          parameter_mappings: getParameterMappings(
            targetDashcard,
            parameter_id,
            targetDashcard.card_id,
            selectedMappingOption.target,
          ),
        },
      });
    }
  }
  return targetDashcardMappings;
}

export function getParameterMappings(
  dashcard: QuestionDashboardCard,
  parameter_id: ParameterId,
  card_id: CardId,
  target: ParameterTarget | null,
) {
  const isVirtual = isVirtualDashCard(dashcard);
  const isAction = isActionDashCard(dashcard);

  let parameter_mappings = dashcard.parameter_mappings || [];

  // allow mapping the same parameter to multiple action targets
  if (!isAction) {
    parameter_mappings = parameter_mappings.filter(
      m => m.card_id !== card_id || m.parameter_id !== parameter_id,
    );
  }

  if (target) {
    if (isVirtual) {
      // If this is a virtual (text) card, remove any existing mappings for the target, since text card variables
      // can only be mapped to a single parameter.
      parameter_mappings = parameter_mappings.filter(
        m => !_.isEqual(m.target, target),
      );
    }
    parameter_mappings = parameter_mappings.concat({
      parameter_id,
      card_id,
      target,
    });
  }

  return parameter_mappings;
}
