<template>
  <slot :style="getIconStyle" :render="renderHtml">
    <template v-if="renderHtml">
      <div class="dynamic-icon" :style="getIconStyle" v-bind="$attrs" v-html="renderHtml"></div>
    </template>
    <template v-else>
      <div class="dynamic-icon" :style="getIconStyle" v-bind="$attrs">
        <slot name="empty"></slot>
      </div>
    </template>
  </slot>
</template>

<script setup lang="ts">
import { findVueComponent } from "@/utils";
import { shallowRef, watch, createVNode, render, getCurrentInstance, computed } from "vue";
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    icon: string | undefined;
    width?: number | string | undefined;
    height?: number | string | undefined;
  }>(),
  {
    width: "1em",
    height: "1em",
  }
);

const renderHtml = shallowRef<string>();
const instance = getCurrentInstance();
let renderVersion = 0;

const getIconStyle = computed(() => {
  const style: Record<string, string | number> = {};
  if (props.width !== undefined) {
    style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
  }
  if (props.height !== undefined) {
    style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
  }
  return style;
});

watch(
  () => props.icon,
  () => {
    renderIcon();
  },
  { immediate: true }
);

async function renderIcon() {
  const version = ++renderVersion;
  const icon = (props.icon || "").trim();

  if (!icon) {
    setRenderHtml(version);
    return;
  }

  try {
    const component = findVueComponent(instance, icon);
    if (isRenderableComponent(component)) {
      const htmlContent = renderComponentToHtml(component);
      const html = htmlContent.includes("<svg") ? await processSvgString(htmlContent) : htmlContent;
      setRenderHtml(version, html);
    } else if (isHtmlTag(icon)) {
      const html = icon.includes("<svg") ? await processSvgString(icon) : icon;
      setRenderHtml(version, html);
    } else if (isImagePath(icon) || isBase64Image(icon)) {
      setRenderHtml(
        version,
        `<img style="width:100%;height:100%;object-fit:contain;" src="${escapeHtmlAttribute(icon)}" alt="" />`
      );
    } else {
      setRenderHtml(version);
    }
  } catch {
    setRenderHtml(version);
  }
}

function setRenderHtml(version: number, html?: string) {
  if (version === renderVersion) {
    renderHtml.value = html;
  }
}

function isRenderableComponent(component: unknown): component is Component {
  return component !== null && (typeof component === "object" || typeof component === "function");
}

function renderComponentToHtml(component: Component) {
  if (typeof document === "undefined") return "";

  const div = document.createElement("div");
  const vnode = createVNode(component);
  if (instance?.appContext) {
    vnode.appContext = instance.appContext;
  }

  try {
    render(vnode, div);
    return div.innerHTML;
  } finally {
    render(null, div);
  }
}

// '<svg></svg>'
function isHtmlTag(str: string) {
  return /<[a-z][\s\S]*>/i.test(str.trim());
}

// (./a.png || /a.png) || (http://a/a.png || https://a/a.png)
function isImagePath(str: string) {
  return /\.(png|jpe?g|gif|svg|webp|avif)([?#].*)?$/i.test(str);
}

// data:image/png;base64,
function isBase64Image(str: string) {
  return str.startsWith("data:image");
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function calculateViewBoxFromSvgString(svgString: string) {
  return new Promise<string | undefined>(resolve => {
    if (typeof document === "undefined") {
      resolve(undefined);
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.innerHTML = svgString.trim();
    const svgElement = tempDiv.querySelector<SVGSVGElement>("svg");
    if (!svgElement) {
      resolve(undefined);
      return;
    }

    document.body.appendChild(tempDiv);

    requestAnimationFrame(() => {
      try {
        const elements = Array.from(
          svgElement.querySelectorAll<SVGGraphicsElement>(
            "path, rect, circle, ellipse, line, polyline, polygon, g, use"
          )
        );
        const graphics = elements.length ? elements : [svgElement as unknown as SVGGraphicsElement];
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        graphics.forEach(element => {
          try {
            const bbox = element.getBBox();
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, bbox.x + bbox.width);
            maxY = Math.max(maxY, bbox.y + bbox.height);
          } catch {
            // Some SVG nodes cannot provide a bbox in all browsers.
          }
        });

        if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
          resolve(undefined);
          return;
        }

        resolve(`${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
      } finally {
        document.body.removeChild(tempDiv);
      }
    });
  });
}

async function processSvgString(svgString: string) {
  if (typeof document === "undefined") return svgString;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = svgString.trim();
  const svgElement = tempDiv.querySelector("svg");
  if (!svgElement) return svgString;

  const viewBox = await calculateViewBoxFromSvgString(svgString);
  if (!svgElement.hasAttribute("viewBox")) {
    if (viewBox) {
      svgElement.setAttribute("viewBox", viewBox);
    } else {
      svgElement.setAttribute("viewBox", "0 0 100 100");
    }
  }
  svgElement.removeAttribute("class");
  svgElement.removeAttribute("style");
  svgElement.removeAttribute("width");
  svgElement.removeAttribute("height");
  svgElement.setAttribute("style", "width:100%;height:100%;display:block;");
  return tempDiv.innerHTML;
}
</script>

<style lang="scss" scoped>
.dynamic-icon {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  > img {
    object-fit: contain;
  }
}
</style>
