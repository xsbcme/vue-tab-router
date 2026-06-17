import type { ComponentPublicInstance } from "vue";
import type { DynamicIframeExpose } from "@/iframe/iframe-message";

export type IframeRefValue = Element | ComponentPublicInstance | DynamicIframeExpose | null;
