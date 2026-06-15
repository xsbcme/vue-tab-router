import { createIframeTabClient } from "@xsbcme/vue-tab-router/iframe-client";

const client = createIframeTabClient();
const logEl = document.getElementById("log");
const loadIdEl = document.getElementById("loadId");
const loadId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const baseTitle = "Iframe Client 演示";
let titleUpdateCount = 0;

if (loadIdEl) {
  loadIdEl.textContent = loadId;
}

const appendLog = (message: string) => {
  if (!logEl) return;
  logEl.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
};

const bindButton = (id: string, handler: () => void) => {
  document.getElementById(id)?.addEventListener("click", handler);
};

bindButton("inspect", async () => {
  const tab = await client.getTab();
  appendLog(`当前 tab：${JSON.stringify(tab)}`);
});

bindButton("update", async () => {
  titleUpdateCount++;
  await client.updateTabOptions({
    _viewName: `${baseTitle} · 更新 ${titleUpdateCount}`,
  });
  appendLog(`已请求宿主更新当前 tab 标题：${titleUpdateCount}`);
});

bindButton("open", async () => {
  const tabId = await client.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "iframe-client 打开的子标签",
    fromIframeClient: true,
  });
  appendLog(`已请求宿主打开子标签：${tabId || "无返回 id"}`);
});

bindButton("refresh", async () => {
  const result = await client.refreshTab();
  appendLog(`已请求宿主刷新当前标签：${result}`);
});

bindButton("close", async () => {
  const result = await client.closeTab();
  appendLog(`已请求宿主关闭当前标签：${result}`);
});

bindButton("emit", async () => {
  const tab = await client.getTab();
  const result = await client.emit("iframe-client:hello", {
    tabId: tab._id,
    loadId,
    time: new Date().toISOString(),
  });
  appendLog(`已向来源标签发送事件：${result}`);
});

client.on("iframe-client:reply", data => {
  appendLog(`收到宿主回包：${JSON.stringify(data)}`);
});

client.on("*", data => {
  appendLog(`收到通用消息：${JSON.stringify(data)}`);
});

appendLog(`iframe client ready ${loadId}`);
