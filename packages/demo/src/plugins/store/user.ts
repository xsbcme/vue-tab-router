import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/model/user";
import vueRouter from "@/plugins/vue-router";
import tabRouter, { storageAdapter } from "@/plugins/tab-router";

export default defineStore("user", () => {
  const user = ref<User | null>(new User(storageAdapter.get("user")));

  const getToken = computed(() => user.value?.token);
  const getUsername = computed(() => user.value?.username);

  function setUser(userInfo: User | null) {
    if (userInfo) {
      user.value = new User(userInfo);
      storageAdapter.set("user", user.value);
    } else {
      user.value = null;
      storageAdapter.del("user");
    }
  }

  async function login(username: string, password: string, redirect?: string) {
    const user = new User();
    user.username = username;
    user.password = password;
    user.token = "helloworld";

    setUser(user);

    tabRouter.openFirstTab("/src/views/home/page-index.vue", {
      _viewName: "首页",
    });
    vueRouter.replace(normalizeLoginRedirect(redirect));
  }

  async function logout() {
    vueRouter.replace("/login");
    tabRouter.clear();
    setUser(null);
  }

  return {
    getToken,
    getUsername,
    login,
    logout,
  };
});

function normalizeLoginRedirect(redirect?: string) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/login")) {
    return "/dashboard";
  }
  return redirect;
}
