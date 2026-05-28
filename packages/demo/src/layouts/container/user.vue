<template>
  <div class="user">
    <a-dropdown :popup-max-height="false">
      <div class="user-info">
        <a-avatar :size="32">
          <IconUser />
        </a-avatar>
        <span>欢迎您，{{ userStore.getUsername || "未登录" }}</span>
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
<script lang="ts" setup>
import { useUserStore } from "@/plugins/store";
import { Message, Modal } from "@arco-design/web-vue";
import { IconUser, IconDown, IconPoweroff } from "@arco-design/web-vue/es/icon";

const userStore = useUserStore();

const handleLogout = () => {
  Modal.confirm({
    title: "退出提示",
    content: `您确定要退出系统吗？`,
    onBeforeOk(done) {
      userStore
        .logout()
        .then(() => {
          Message.success("退出系统成功");
        })
        .finally(() => {
          done(true);
        });
    },
  });
};
</script>
<style lang="scss" scoped>
.user {
  &-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
}
</style>
