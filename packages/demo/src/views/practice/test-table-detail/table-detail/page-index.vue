<template>
  <div class="practice-page">
    <a-card :title="`客户详情 ${record.name}`" :bordered="false">
      <a-space direction="vertical" fill size="large">
        <a-alert :type="dirty ? 'warning' : 'info'">
          {{ dirty ? "当前客户详情有未保存修改，关闭标签会触发确认。" : "编辑备注后保存，会通过来源页签事件回写列表。" }}
        </a-alert>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
          <a-descriptions-item label="加载批次">{{ loadSeed }}</a-descriptions-item>
          <a-descriptions-item label="加载时间">{{ loadedAt }}</a-descriptions-item>
          <a-descriptions-item label="保存次数">{{ saveCount }}</a-descriptions-item>
          <a-descriptions-item label="客户编号">{{ record.key }}</a-descriptions-item>
          <a-descriptions-item label="客户名称">{{ record.name }}</a-descriptions-item>
          <a-descriptions-item label="客户等级">{{ form.level }}</a-descriptions-item>
          <a-descriptions-item label="负责人">{{ record.owner || "-" }}</a-descriptions-item>
          <a-descriptions-item label="预计客单价">￥{{ record.salary.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="区域">{{ record.address }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ record.email }}</a-descriptions-item>
          <a-descriptions-item label="最近处理">{{ record.updatedAt || "-" }}</a-descriptions-item>
        </a-descriptions>
        <a-form :model="form" layout="vertical">
          <a-form-item label="客户等级">
            <a-radio-group v-model="form.level" @change="dirty = true">
              <a-radio value="重点">重点</a-radio>
              <a-radio value="成长">成长</a-radio>
              <a-radio value="观察">观察</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="跟进备注">
            <a-textarea v-model="form.remark" :auto-size="{ minRows: 4, maxRows: 6 }" @input="dirty = true" />
          </a-form-item>
        </a-form>
        <a-space wrap>
          <a-button type="primary" @click="save">保存并回写来源列表</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新详情</a-button>
          <a-button @click="renameTab">更新标签标题</a-button>
          <a-button status="danger" @click="tabsManager.closeTab()">关闭当前详情</a-button>
        </a-space>
      </a-space>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { onBeforeTabClose, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

interface CustomerRecord {
  key: string;
  name: string;
  salary: number;
  address: string;
  email: string;
  owner?: string;
  level?: "重点" | "成长" | "观察";
  remark?: string;
  updatedAt?: string;
}

const props = defineProps<{
  record: CustomerRecord;
}>();

const tabsManager = useTabsManager();
const tabId = useTabId();
const loadSeed = Date.now();
const loadedAt = new Date(loadSeed).toLocaleTimeString();
const dirty = ref(false);
const saveCount = ref(0);
const form = reactive({
  level: props.record.level || "成长",
  remark: props.record.remark || `跟进 ${props.record.name}，加载批次：${loadSeed}`,
});

onBeforeTabClose(async () => {
  if (!dirty.value) return true;
  return window.confirm("客户详情尚未保存，确认关闭当前标签？");
});

const save = () => {
  dirty.value = false;
  saveCount.value += 1;
  const time = new Date().toLocaleTimeString();
  tabsManager.emit("customer:saved", {
    key: props.record.key,
    level: form.level,
    remark: `${form.remark}（保存次数：${saveCount.value}）`,
    time,
  });
  Message.success("已保存，并通过来源页签事件回写列表");
};

const renameTab = () => {
  tabsManager.updateTabOptions({
    _viewName: `已跟进 ${props.record.name}`,
  });
};
</script>

<style scoped>
.practice-page {
  padding: 16px;
  min-height: 100%;
  background: #f7f8fa;
}

@media (max-width: 768px) {
  .practice-page {
    padding: 8px;
  }
}
</style>
