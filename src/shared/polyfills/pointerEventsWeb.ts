import React from "react";
import { Platform, StyleSheet } from "react-native";

import { shadowStyleToBoxShadow } from "@/shared/utils/shadow";

type AnyProps = Record<string, unknown>;
type PropsLike = AnyProps | null | undefined;
type JsxFactory = (...args: any[]) => any;
type JsxRuntimeModule = Record<string, JsxFactory | undefined>;

const GLOBAL_FLAG = "__gnhPointerEventsPatched__";
const globalScope = globalThis as typeof globalThis & Record<string, boolean | undefined>;
const pointerEventStyles = StyleSheet.create({
  auto: { pointerEvents: "auto" },
  none: { pointerEvents: "none" },
  boxNone: { pointerEvents: "box-none" },
  boxOnly: { pointerEvents: "box-only" },
});
const POINTER_STYLE_MAP: Record<string, unknown> = {
  auto: pointerEventStyles.auto,
  none: pointerEventStyles.none,
  "box-none": pointerEventStyles.boxNone,
  "box-only": pointerEventStyles.boxOnly,
};

function normalizeShadow(style: unknown) {
  if (!style || typeof style !== "object") {
    return style;
  }

  const shadowStyle = style as Record<string, unknown>;
  if (shadowStyle.$$css === true) {
    return style;
  }

  const hasShadow =
    shadowStyle.shadowColor != null ||
    shadowStyle.shadowOpacity != null ||
    shadowStyle.shadowOffset != null ||
    shadowStyle.shadowRadius != null;

  if (!hasShadow) {
    return style;
  }

  const boxShadow = shadowStyleToBoxShadow(shadowStyle);
  const { shadowColor, shadowOpacity, shadowOffset, shadowRadius, ...rest } = shadowStyle;
  if (!boxShadow) {
    return rest;
  }

  return {
    ...rest,
    boxShadow,
  };
}

function normalizeStyle(style: unknown): unknown {
  if (Array.isArray(style)) {
    return style.map((item) => normalizeStyle(item));
  }
  return normalizeShadow(style);
}

function hasPointerInStyle(style: unknown): boolean {
  if (!style) {
    return false;
  }

  if (Array.isArray(style)) {
    return style.some((item) => hasPointerInStyle(item));
  }

  return typeof style === "object" && "pointerEvents" in (style as Record<string, unknown>);
}

function withPointerEvents(props: PropsLike): PropsLike {
  if (!props) {
    return props;
  }

  const typedProps = props as AnyProps & { pointerEvents?: unknown; style?: unknown };
  const pointerValue = typedProps.pointerEvents;
  if (pointerValue == null || typeof pointerValue !== "string") {
    return typedProps.style ? withNormalizedStyle(typedProps) : props;
  }

  const pointerStyle = POINTER_STYLE_MAP[pointerValue];
  if (!pointerStyle) {
    return typedProps.style ? withNormalizedStyle(typedProps) : props;
  }

  const { style, pointerEvents: _ignoredPointer, ...rest } = typedProps;
  const nextStyle = hasPointerInStyle(style)
    ? style
    : (() => {
        if (Array.isArray(style)) {
          return [...style, pointerStyle];
        }
        if (style != null) {
          return [style, pointerStyle];
        }
        return pointerStyle;
      })();

  return withNormalizedStyle({
    ...rest,
    style: nextStyle,
  });
}

function withNormalizedStyle(props: AnyProps): AnyProps {
  if (!props.style) {
    return props;
  }

  const normalizedStyle = normalizeStyle(props.style);
  if (normalizedStyle === props.style) {
    return props;
  }

  return {
    ...props,
    style: normalizedStyle,
  };
}

function patchCreateElement() {
  const originalCreateElement = React.createElement;

  React.createElement = function patchedCreateElement(type: unknown, props: PropsLike, ...rest: unknown[]) {
    const nextProps = withPointerEvents(props);
    return originalCreateElement(type as any, nextProps, ...rest);
  } as typeof React.createElement;
}

function patchJsxFactory(module: JsxRuntimeModule | null, exportName: string) {
  if (!module) {
    return;
  }

  const originalFactory = module[exportName];
  if (typeof originalFactory !== "function") {
    return;
  }

  module[exportName] = function patchedFactory(type: unknown, props: PropsLike, ...rest: unknown[]) {
    const nextProps = withPointerEvents(props);
    return (originalFactory as JsxFactory)(type, nextProps, ...rest);
  };
}

function loadJsxRuntime(): JsxRuntimeModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react/jsx-runtime") as JsxRuntimeModule;
  } catch {
    return null;
  }
}

function loadJsxDevRuntime(): JsxRuntimeModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react/jsx-dev-runtime") as JsxRuntimeModule;
  } catch {
    return null;
  }
}

function patchJsxFactories() {
  const runtime = loadJsxRuntime();
  patchJsxFactory(runtime, "jsx");
  patchJsxFactory(runtime, "jsxs");

  const devRuntime = loadJsxDevRuntime();
  patchJsxFactory(devRuntime, "jsx");
  patchJsxFactory(devRuntime, "jsxs");
  patchJsxFactory(devRuntime, "jsxDEV");
}

if (Platform.OS === "web" && !globalScope[GLOBAL_FLAG]) {
  patchCreateElement();
  patchJsxFactories();
  globalScope[GLOBAL_FLAG] = true;
}
