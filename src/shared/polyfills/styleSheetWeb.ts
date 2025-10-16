import { Platform, StyleSheet } from "react-native";

import { shadowStyleToBoxShadow } from "@/shared/utils/shadow";

const GLOBAL_FLAG = "__gnhStyleSheetPatched__";
const globalScope = globalThis as typeof globalThis & Record<string, boolean | undefined>;

function transformStyle(style: any) {
  if (!style || typeof style !== "object") {
    return style;
  }

  const boxShadow = shadowStyleToBoxShadow(style);
  if (!boxShadow) {
    return style;
  }

  const { shadowColor, shadowOpacity, shadowOffset, shadowRadius, ...rest } = style;
  return {
    ...rest,
    boxShadow,
  };
}

function transformStyles(styles: Record<string, any>) {
  const next: Record<string, any> = {};
  for (const key of Object.keys(styles)) {
    const value = styles[key];
    if (Array.isArray(value)) {
      next[key] = value.map((item) => transformStyle(item));
    } else {
      next[key] = transformStyle(value);
    }
  }
  return next;
}

if (Platform.OS === "web" && !globalScope[GLOBAL_FLAG]) {
  const originalCreate = StyleSheet.create;
  StyleSheet.create = function patchedCreate(styles: Record<string, any>) {
    return originalCreate(transformStyles(styles));
  } as typeof StyleSheet.create;

  globalScope[GLOBAL_FLAG] = true;
}
