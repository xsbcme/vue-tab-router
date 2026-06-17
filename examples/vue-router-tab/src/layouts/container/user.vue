<template>
  <div class="user">
    <a-dropdown :popup-max-height="false">
      <div class="user-info">
        <a-avatar :size="32">
          <IconUser />
        </a-avatar>
        <span class="user-name"><span class="user-greeting">欢迎您，</span>{{ username }}</span>
        <IconDown />
      </div>
      <template #content>
        <a-doption @click="handleLogout()">
          <template #icon>
            <IconPoweroff />
          </template>
          <template #default>退出登录</template>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from "@arco-design/web-vue";
import { IconDown, IconPoweroff, IconUser } from "@arco-design/web-vue/es/icon";

const username = "Router Admin";

const emit = defineEmits<{
  (event: "logout"): void;
}>();

const handleLogout = () => {
  Modal.confirm({
    title: "退出提示",
    content: "您确定要退出当前演示账号吗？",
    onBeforeOk(done) {
      Message.success("已退出演示账号");
      emit("logout");
      done(true);
    },
  });
};
</script>

<style scoped lang="scss">
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.user-name {
  color: var(--color-text-1);
  font-size: 14px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .user-info {
    gap: 4px;
  }

  .user-name {
    display: inline-block;
    max-width: 72px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-greeting {
    display: none;
  }

  :deep(.arco-avatar) {
    width: 28px !important;
    height: 28px !important;
    font-size: 14px !important;
  }
}
</style>
