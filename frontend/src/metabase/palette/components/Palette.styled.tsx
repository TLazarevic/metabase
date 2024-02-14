import styled from "@emotion/styled";
import { Button, Icon, TextInput } from "metabase/ui";
import Modal from "metabase/components/Modal";
import {KBarSearch} from "kbar";
import {color} from "metabase/lib/colors";

export const PaletteModal = styled(Modal)`
  // Stolen from Github
  position: fixed;
  margin: 10vh auto;
  top: 0;
  z-index: 999;
  max-height: 80vh;
  max-width: 90vw;
  width: 448px;
  overflow: auto;
  box-shadow: 0 1px 0.25rem 0 rgba(0, 0, 0, 0.06);
  border-radius: 0.25rem;
  min-height: 50vh;
  // max-height: max(50vh, 570px);
  padding: 1rem;
  padding-bottom: .25rem;
  display: flex;

  // Is this useful? I got it from the palette on notion
  transform: translate3d(0px, 0px, 0px);

  // fix later
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
  button {
    display: flex;
    flex-flow: row nowrap;
  }
`;

export const PaletteResult = styled.li<{ active?: boolean }>`
  border-radius: 0.25rem;
  background-color: ${props =>
    props.active ? color('brand-light') : "transparent"};
  list-style: none;
  display: flex;
  cursor: pointer;
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
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
  margin-top: 1rem;
  padding: 0;
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

// export const StyledPalette = styled(CommandPalette)`
//   & input {
//     font-weight: bold !important;
//   }
// `;

export const PaletteInput = styled(KBarSearch)`
  padding: .5rem;
`
