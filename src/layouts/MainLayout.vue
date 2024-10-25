<template>
  <q-layout view="lHh LpR lFf">
    <q-header
      reveal
    class="bg-transparent"
    >
      <q-toolbar :class="$q.dark.isActive ? 'header_dark' : 'header_normal'">
        <q-btn
          @click="left = !left"
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
        />
        <!--          <q-avatar>-->
        <!--            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">-->
        <!--          </q-avatar>-->

        <q-toolbar-title>
          <q-select
            @update:model-value="setStore"
            :model-value="user?.stores.find(st=> st.pivot.active)"
            :options="stores"
            :option-label="st => st.name.length > 25 ? `${st.name.substring(0, 25)}...` : st.name"
            :option-value="st => st.id"
            outlined
            dense
            style="width: 230px;max-width: 100%"
            class="float-left text-white"
            bg-color="white"
            label="Tienda Activa"
          ></q-select>
        </q-toolbar-title>
        <q-btn
          class="q-mr-xs"
          flat
          round
          @click="$q.dark.toggle()"
          :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
        />
        <q-btn
          flat
          round
          dense
          icon="fas fa-sign-out-alt"
          @click="logoutNotify"
        />
      </q-toolbar>
      <div class="q-gutter-sm q-pt-md q-pl-md">
      <q-chip @remove="removeNavigationItem(item.page_name)" clickable @click="$router.push(item.page_link)" v-for="(item, i) in navigation_list" :key="i"  removable class="tab-active" text-color="white" :icon="item.page_icon">
        {{ item.page_name }}
      </q-chip>

    </div>
    </q-header>
    <q-drawer
      class="left-navigation text-white"
      show-if-above
      v-model="left"
      side="left"
      elevated
    >
      <div
        class="full-height"
        :class="$q.dark.isActive ? 'drawer_dark' : 'drawer_normal'"
      >
        <div style="height: calc(100% - 117px);padding:10px;">
          <q-toolbar>
            <q-avatar class="cursor-pointer" @click="$router.push({ path: '/my_profile' });storePageDetails('Mi Perfil', 'my_profile', 'contact_emergency')" v-ripple>
              <img :src="`${server}/storage/${user?.avatar}`"/>
            </q-avatar>

            <q-toolbar-title>{{user?.name}}</q-toolbar-title>
          </q-toolbar>
          <hr/>
          <q-scroll-area style="height:100%;">
            <q-list padding>
              <q-item
                active-class="tab-active"
                @click="storePageDetails('Dashboard', 'dashboard', 'dashboard')"
                to="/dashboard"
                exact
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="dashboard"/>
                </q-item-section>

                <q-item-section>
                  Dashboard
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar usuarios')"
                active-class="tab-active"
                @click="storePageDetails('Usuarios del Sistema', 'users', 'group')"
                to="/users"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="group"/>
                </q-item-section>

                <q-item-section>
                  Usuarios del Sistema
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar roles')"
                active-class="tab-active"
                @click="storePageDetails('Roles de Usuario', 'roles', 'admin_panel_settings')"
                to="/roles"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings"/>
                </q-item-section>

                <q-item-section>
                  Roles de Usuario
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar colores')"
                active-class="tab-active"
                @click="storePageDetails('Colores', 'colors', 'palette')"
                to="/colors"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="palette"/>
                </q-item-section>

                <q-item-section>
                  Colores
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar grupos')"
                active-class="tab-active"
                @click="storePageDetails('Grupos', 'groups', 'category')"
                to="/groups"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="category"/>
                </q-item-section>

                <q-item-section>
                  Grupos
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar ivas')"
                active-class="tab-active"
                @click="storePageDetails('IVA', 'ivas', 'price_check')"
                to="/ivas"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="price_check"/>
                </q-item-section>

                <q-item-section>
                  IVA
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar artículos')"
                active-class="tab-active"
                @click="storePageDetails('Artículos', 'items', 'widgets')"
                to="/items"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="widgets"/>
                </q-item-section>

                <q-item-section>
                  Artículos
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar artículos')"
                active-class="tab-active"
                @click="storePageDetails('Tiendas', 'stores', 'store')"
                to="/stores"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="store"/>
                </q-item-section>

                <q-item-section>
                  Tiendas
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar entidades')"
                active-class="tab-active"
                @click="storePageDetails('Entidades', 'entities', 'hail')"
                to="/entities"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="hail"/>
                </q-item-section>

                <q-item-section>
                  Entidades
                </q-item-section>
              </q-item>

              <q-item
                v-if="user?.roles[0].permissions.find(p => p.name === 'listar compras')"
                active-class="tab-active"
                @click="storePageDetails('Compras', 'purchases', 'shopping_cart')"
                to="/purchases"
                class="q-ma-sm navigation-item"
                clickable
                v-ripple
              >
                <q-item-section avatar>
                  <q-icon name="shopping_cart"/>
                </q-item-section>

                <q-item-section>
                  Compras
                </q-item-section>
              </q-item>

            </q-list>
          </q-scroll-area>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="row no-wrap">
        <div class="col">
          <div class="full-height">
            <q-scroll-area class="col q-pr-sm full-height" visible>
              <router-view/>
            </q-scroll-area>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useQuasar} from "quasar";
import {useAuthStore} from "stores/auth-store";
import {storeToRefs} from "pinia";
import {server} from "boot/axios";
import {useRouter} from "vue-router";
import {useStoreStore} from "stores/store-store";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const {user, token} = storeToRefs(authStore);
const storeStore = useStoreStore();
const {stores} = storeToRefs(storeStore);
let left = ref(false);
let navigation_list = ref([]);

const logoutNotify = () => {
  $q.notify({
    icon: 'logout',
    message: "Se ha cerrado la sesión."
  });
  localStorage.clear();
  sessionStorage.clear();
  authStore.reset();
  router.push({ path: '/' });
}

onMounted(() => {
  navigation_list.value = $q.sessionStorage.getItem("navigation_items");
  if (!user.value){
    user.value = JSON.parse(localStorage.getItem('user') ?? 'null');
  }
  if (!storeStore.fetched){
    storeStore.getStores(token.value);
  }
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'none'; // Oculta el preloader
  }
})

const removeNavigationItem = (page_name) => {
  let navigation_items = [];
  navigation_items = $q.sessionStorage.getItem("navigation_items");
  navigation_items = navigation_items.filter(function(item){
    return item.page_name !== page_name;
  });
  navigation_list.value = navigation_items;
  $q.sessionStorage.set("navigation_items", navigation_items);
}

const storePageDetails = (page_name, link, icon) => {
  if ($q.sessionStorage.getItem("navigation_items")) {
    let navigation_items = [];
    navigation_items = $q.sessionStorage.getItem("navigation_items");
    let result = navigation_items.find(function(item){
      return item.page_name === page_name;
    });
    if (!result) {
      navigation_items.push({page_name: page_name, page_link: link, page_icon: icon});
      navigation_list.value = navigation_items;
      $q.sessionStorage.set("navigation_items", navigation_items);
    }
  }else{
    navigation_list.value = [{page_name: page_name, page_link: link}];
    $q.sessionStorage.set("navigation_items", [{page_name: page_name, page_link: link}]);
  }
}

const setStore = async (st) => {
  await authStore.setActiveStore(st.id)
}
</script>

<style>
.q-drawer {
  background-image: url("../assets/lake.jpg") !important;
  background-size: cover !important;
}

.drawer_normal {
  background-color: rgba(1, 1, 1, 0.75);
}

.drawer_dark {
  background-color: #010101f2;
}

.navigation-item {
  border-radius: 5px;
}

.tab-active {
  background-color: green;
}

body {
  background: #f1f1f1 !important;
}

.header_normal {
  background: linear-gradient(
    145deg,
    rgb(32, 106, 80) 15%,
    rgb(21, 57, 102) 70%
  );
}

.header_dark {
  background: linear-gradient(145deg, rgb(61, 14, 42) 15%, rgb(14, 43, 78) 70%);
}

.q-scrollarea__content {
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}
</style>
