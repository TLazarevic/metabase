/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { jt } from "ttag";
import { useLocation } from "react-use";
import ExternalLink from "metabase/core/components/ExternalLink";
import { color } from "metabase/lib/colors";
import SettingHeader from "./SettingHeader";
import { SettingInput } from "./widgets/SettingInput";
import SettingNumber from "./widgets/SettingNumber";
import SettingPassword from "./widgets/SettingPassword";
import SettingRadio from "./widgets/SettingRadio";
import SettingToggle from "./widgets/SettingToggle";
import SettingSelect from "./widgets/SettingSelect";
import SettingText from "./widgets/SettingText";
import { settingToFormFieldId, getEnvVarDocsUrl } from "./../../settings/utils";
import {
  SettingContent,
  SettingEnvVarMessage,
  SettingErrorMessage,
  SettingRoot,
  SettingWarningMessage,
} from "./SettingsSetting.styled";

const SETTING_WIDGET_MAP = {
  string: SettingInput,
  number: SettingNumber,
  password: SettingPassword,
  select: SettingSelect,
  radio: SettingRadio,
  boolean: SettingToggle,
  text: SettingText,
};

const SettingSetting = props => {
  const { hash } = useLocation();
  const [fancyStyle, setFancyStyle] = useState({});
  const thisRef = useRef();

  const { setting, settingValues, errorMessage } = props;

  useEffect(() => {
    if (hash === `#${setting.key}`) {
      setTimeout(() => {
        thisRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        thisRef.current.focus();

        setFancyStyle({
          background: "rgba(80, 158, 227, 0.1)",
          border: `${color("brand")} solid 1px`,
        });

        setTimeout(() => {
          setFancyStyle({});
        }, 1500);
      }, 500);
    }
  }, [hash, setting.key]);

  const settingId = settingToFormFieldId(setting);

  let Widget = setting.widget || SETTING_WIDGET_MAP[setting.type];
  if (!Widget) {
    console.warn(
      "No render method for setting type " +
        setting.type +
        ", defaulting to string input.",
    );
    Widget = SettingInput;
  }

  const widgetProps = {
    ...setting.getProps?.(setting, settingValues),
    ...setting.props,
    ...props,
  };

  return (
    // TODO - this formatting needs to be moved outside this component
    <SettingRoot
      data-testid={`${setting.key}-setting`}
      ref={thisRef}
      style={{
        //border: `${color("brand")} solid 0px`,
        transition: "500ms ease all",
        ...fancyStyle,
      }}
    >
      {!setting.noHeader && <SettingHeader id={settingId} setting={setting} />}
      <SettingContent>
        {setting.is_env_setting && !setting.forceRenderWidget ? (
          <SettingEnvVarMessage>
            {jt`This has been set by the ${(
              <ExternalLink href={getEnvVarDocsUrl(setting.env_name)}>
                {setting.env_name}
              </ExternalLink>
            )} environment variable.`}
          </SettingEnvVarMessage>
        ) : (
          <Widget id={settingId} {...widgetProps} />
        )}
      </SettingContent>
      {errorMessage && (
        <SettingErrorMessage>{errorMessage}</SettingErrorMessage>
      )}
      {setting.warning && (
        <SettingWarningMessage>{setting.warning}</SettingWarningMessage>
      )}
    </SettingRoot>
  );
};

export default SettingSetting;
