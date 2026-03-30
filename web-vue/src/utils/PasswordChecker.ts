import { useI18n } from "vue-i18n";

const checkers: Record<string, (password: string, t: (key: string) => string) => string> = {
  AtLeast6: (password, t) =>
    password.length < 6 ? t("user.The password must have at least 6 characters") : "",
  AtLeast8: (password, t) =>
    password.length < 8 ? t("user.The password must have at least 8 characters") : "",
  Aa123: (password, t) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/.test(password)
      ? ""
      : t("user.The password must contain at least one uppercase letter, one lowercase letter and one digit"),
  SpecialChar: (password, t) =>
    /^(?=.*[!-/:-@[-`{-~]).+$/.test(password)
      ? ""
      : t("user.The password must contain at least one special character"),
  NoRepeat: (password, t) =>
    /(.)\1+/.test(password)
      ? t("user.The password must not contain any repeated characters")
      : "",
};

const optionDescriptions: Record<string, string> = {
  AtLeast6: "user.The password must have at least 6 characters",
  AtLeast8: "user.The password must have at least 8 characters",
  Aa123: "user.The password must contain at least one uppercase letter, one lowercase letter and one digit",
  SpecialChar: "user.The password must contain at least one special character",
  NoRepeat: "user.The password must not contain any repeated characters",
};

export function checkPasswordComplexity(
  password: string,
  options: string[] | undefined,
  t: (key: string) => string
): string {
  if (!password?.length) {
    return t("login.Please input your password!");
  }
  if (!options || options.length === 0) return "";

  for (const option of options) {
    const checkerFunc = checkers[option];
    if (checkerFunc) {
      const errorMsg = checkerFunc(password, t);
      if (errorMsg !== "") return errorMsg;
    }
  }
  return "";
}

export interface PasswordCheckItem {
  option: string;
  description: string;
  passed: boolean;
}

export function getPasswordCheckItems(
  options: string[] | undefined,
  password: string,
  t: (key: string) => string
): PasswordCheckItem[] {
  if (!options) return [];
  return options.map((option) => ({
    option,
    description: t(optionDescriptions[option] || option),
    passed: checkers[option] ? checkers[option](password, t) === "" : true,
  }));
}
