/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 系统标题
   */
  readonly VITE_SYSTEM_TITLE: string;
}

interface Window {
  __PLUGIN_VERSION__: string;
}
