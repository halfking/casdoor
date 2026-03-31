import type { ThemeConfig } from "ant-design-vue/es/config-provider/context";
import { theme } from "ant-design-vue";
import * as Conf from "../Conf";

export interface CasdoorThemeData {
  isEnabled?: boolean;
  themeType?: "default" | "dark";
  colorPrimary?: string;
  borderRadius?: number;
  isCompact?: boolean;
}

export function getThemeData(
  organization?: { themeData?: CasdoorThemeData },
  application?: { themeData?: CasdoorThemeData }
): CasdoorThemeData {
  if (application?.themeData?.isEnabled) {
    return application.themeData;
  } else if (organization?.themeData?.isEnabled) {
    return organization.themeData;
  }
  return Conf.ThemeDefault;
}

export function getAlgorithmNames(themeData?: CasdoorThemeData): string[] {
  const algorithms = [
    themeData?.themeType !== "dark" ? "default" : "dark",
  ];
  if (themeData?.isCompact) {
    algorithms.push("compact");
  }
  return algorithms;
}

export function getAlgorithm(names: string[]) {
  return names
    .sort()
    .reverse()
    .map((name) => {
      if (name === "dark") return theme.darkAlgorithm;
      if (name === "compact") return theme.compactAlgorithm;
      return theme.defaultAlgorithm;
    });
}

export function buildThemeConfig(themeData: CasdoorThemeData): ThemeConfig {
  const algorithmNames = getAlgorithmNames(themeData);
  return {
    algorithm: getAlgorithm(algorithmNames),
    token: {
      colorPrimary: themeData.colorPrimary ?? Conf.ThemeDefault.colorPrimary,
      borderRadius: themeData.borderRadius ?? Conf.ThemeDefault.borderRadius,
    },
  };
}
