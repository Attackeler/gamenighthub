import { Platform } from "react-native";

import { shadowStyleToBoxShadow } from "@/shared/utils/shadow";

const GLOBAL_FLAG = "__gnhPaperShadowPatched__";
const globalScope = globalThis as typeof globalThis & Record<string, boolean | undefined>;

type ShadowModule = {
  default?: (elevation?: any, isV3?: boolean) => Record<string, unknown> | undefined;
  [key: string]: any;
};

function patchModule(mod: ShadowModule | undefined) {
  if (!mod || typeof mod.default !== "function" || mod.__gnhPatched) {
    return;
  }

  const original = mod.default;

  const patched = function shadow(elevation: any = 0, isV3 = false) {
    if (typeof elevation !== "number") {
      return original(elevation, isV3);
    }

    const base = original(elevation, isV3) ?? {};
    const boxShadow = shadowStyleToBoxShadow(base as any);

    if (!boxShadow) {
      return {};
    }

    return { boxShadow };
  };

  mod.default = patched;
  mod.shadow = patched;
  mod.__gnhPatched = true;
}

if (Platform.OS === "web" && !globalScope[GLOBAL_FLAG]) {
  try {
    patchModule(require("react-native-paper/lib/commonjs/styles/shadow"));
  } catch {
    // noop
  }

  try {
    patchModule(require("react-native-paper/lib/module/styles/shadow"));
  } catch {
    // noop
  }

  globalScope[GLOBAL_FLAG] = true;
}
