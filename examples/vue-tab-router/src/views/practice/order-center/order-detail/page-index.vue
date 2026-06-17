<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" :title="`订单详情 ${order.id}`">
    <div class="practice-page">
      <a-space direction="vertical" fill size="large">
        <a-alert :type="dirty ? 'warning' : 'success'">
          {{
            dirty ? "当前订单有未提交修改，关闭标签时会触发页面级关闭守卫。" : "当前订单没有未提交修改，可以直接关闭。"
          }}
        </a-alert>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
          <a-descriptions-item label="加载批次">{{ loadSeed }}</a-descriptions-item>
          <a-descriptions-item label="加载时间">{{ loadedAt }}</a-descriptions-item>
          <a-descriptions-item label="保存次数">{{ saveCount }}</a-descriptions-item>
          <a-descriptions-item label="订单号">{{ order.id }}</a-descriptions-item>
          <a-descriptions-item label="客户">{{ order.customer }}</a-descriptions-item>
          <a-descriptions-item label="商品">{{ order.product }}</a-descriptions-item>
          <a-descriptions-item label="金额">￥{{ order.amount.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ order.status }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ order.owner }}</a-descriptions-item>
        </a-descriptions>
        <a-form :model="form" layout="vertical">
          <a-form-item label="处理备注">
            <a-textarea v-model="form.remark" :auto-size="{ minRows: 4, maxRows: 6 }" @input="dirty = true" />
          </a-form-item>
        </a-form>
        <a-space wrap>
          <a-button type="primary" @click="save">保存并回传列表</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新详情</a-button>
          <a-button @click="renameTab">更新标签标题</a-button>
          <a-button status="danger" @click="tabsManager.closeTab()">关闭当前详情</a-button>
        </a-space>
      </a-space>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { onBeforeTabClose, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

interface OrderRecord {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  owner: string;
}

const props = defineProps<{
  order: OrderRecord;
}>();

const tabsManager = useTabsManager();
const tabId = useTabId();
const loadSeed = Date.now();
const loadedAt = new Date(loadSeed).toLocaleTimeString();
const dirty = ref(false);
const saveCount = ref(0);
const form = reactive({
  remark: `请跟进 ${props.order.customer} 的 ${props.order.product} 订单。加载批次：${loadSeed}`,
});

onBeforeTabClose(async () => {
  if (!dirty.value) return true;
  return window.confirm("订单备注尚未保存，确认关闭当前标签？");
});

const save = () => {
  dirty.value = false;
  saveCount.value += 1;
  tabsManager.emit("order:saved", {
    orderId: props.order.id,
    remark: `${form.remark}（保存次数：${saveCount.value}）`,
    time: new Date().toLocaleTimeString(),
  });
  Message.success("已保存，并通过来源页签事件回传列表");
};

const renameTab = () => {
  tabsManager.updateTabOptions({
    _viewName: `已处理 ${props.order.id}`,
  });
};
</script>

<style scoped>
.practice-page {
  min-height: 100%;
}
</style>
