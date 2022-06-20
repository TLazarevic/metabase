import styled from "@emotion/styled";

export const TimePickerRoot = styled.div`
  padding: 1rem;
`;

export const BetweenConnector = styled.span`
  margin-right: 1.5rem;
  margin-left: 1rem;
  font-weight: 700;
`;

interface MultiTimePickerRootProps {
  direction: string;
}

export const MultiTimePickerRoot = styled.div<MultiTimePickerRootProps>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-wrap: wrap;

  & > * {
    margin-bottom: 1rem;
  }
`;
