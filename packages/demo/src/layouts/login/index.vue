<template>
  <div class="login">
    <div class="login-wrapper">
      <div class="login-banner">
        <div class="login-banner-title">插件案例</div>
      </div>
      <div class="login-form">
        <a-tabs :style="{ width: '100%' }" default-active-key="Account">
          <a-tab-pane key="Account" title="账户登录">
            <AccountComponent />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import AccountComponent from "./account.vue";
</script>
<style lang="scss" scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-image: url("@/assets/images/login_bg.jpg");
  background-repeat: no-repeat;

  &-wrapper {
    width: 800px;
    background: #fff;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-radius: 0 8px 8px 0;
    display: flex;
  }

  &-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-size: cover;
    background-position: center;
    background-image: url("@/assets/images/login_banner.png");
    background-repeat: no-repeat;
    width: 50%;

    &-title {
      font-size: 24px;
      color: #fff;
      letter-spacing: 1px;
    }
  }

  &-form {
    width: 50%;
    background-color: #fff;
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

@media (max-width: 600px) {
  .login {
    padding: 16px;

    &-wrapper {
      width: 100%;
      flex-direction: column;
    }

    &-banner {
      width: 100%;
      min-height: 300px;
    }

    &-form {
      width: 100%;
    }
  }
}
</style>
