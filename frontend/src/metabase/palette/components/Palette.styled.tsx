import styled from "@emotion/styled";
import { KBarSearch } from "kbar";
import Modal from "metabase/components/Modal";
import { color } from "metabase/lib/colors";
import { Button, Flex, Icon } from "metabase/ui";

export const PaletteModal = styled(Modal)`
  position: fixed;
  margin: 10vh auto;
  top: 0;
  z-index: 999;
  max-height: 80vh;
  max-width: 90vw;
  width: 448px;
  overflow: auto;
  box-shadow: 0 1px 0.25rem 0 rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
  min-height: 50vh;
  // max-height: max(50vh, 570px);
  padding: 0;
  padding-bottom: 0.25rem;
  display: flex;
  transform: translate3d(0px, 0px, 0px);

  // TODO: fix later
  .ModalContent {
    padding-bottom: 0;
  }
  .ModalBody {
    padding: 0;
    flex-grow: 1;
    display: flex;
  }
  #kbar-listbox {
    height: auto;
  }
  // TODO: Needed?
  button {
    display: flex;
    flex-flow: row nowrap;
  }
`;

export const PaletteResult = styled.div<{ active?: boolean }>`
  display: flex;
  background-color: ${props =>
    props.active ? color("brand-light") : "transparent"};
  color: ${props => (props.active ? color("brand") : color("text-medium"))};
  border-radius: 0.5rem;
  cursor: ${props => (props.active ? "pointer" : "default")};
  width: 100%;
  font-weight: bold;
  line-height: 1rem;
`;

export const PaletteResultIcon = styled(Icon)`
  margin-right: 0.5rem;
`;

export const PaletteResultButton = styled(Button)`
  // fix later
`;

export const PaletteResultList = styled.ul`
  flex: 1;
  display: flex;
  align-items: stretch;
  flex-flow: column nowrap;
  padding: 0.75rem 1.5rem;
  // hacky fix
  & > div {
    height: 100%;
    //max-height: unset;
  }
`;

export const PaletteModalContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
`;

export const PaletteInput = styled(KBarSearch)`
  padding: 0.5rem;
  margin: 1.5rem;
  margin-bottom: 0rem;
  font-weight: bold;
`;

export const PaletteResultsSectionHeader = styled.div`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 10px;
  padding: 0.5rem;
`;

export const PaletteFooterContainer = styled(Flex)`
  border-top: 1px solid ${color("border")};
`;
