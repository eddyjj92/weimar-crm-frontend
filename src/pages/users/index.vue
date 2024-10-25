<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-table
        ref="tableRef"
        title="Usuarios del Sistema"
        :rows="users"
        :hide-header="mode === 'grid'"
        :columns="columns"
        row-key="name"
        :grid="mode === 'grid'"
        :filter="filter"
        :pagination:sync="pagination"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top-right="props">
          <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'crear usuarios')" @click="new_user=true" icon="add" outline color="primary" label="Registrar" class="q-mr-xs"/>

          <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>

          <q-btn
            flat
            round
            dense
            :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            @click="props.toggleFullscreen"
            v-if="mode === 'list'"
          >
            <q-tooltip
              :disable="$q.platform.is.mobile"
              v-close-popup
            >{{ props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen' }}
            </q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            :icon="mode === 'grid' ? 'list' : 'grid_on'"
            @click="mode = mode === 'grid' ? 'list' : 'grid'; separator = mode === 'grid' ? 'none' : 'horizontal'"
            v-if="!props.inFullscreen"
          >
            <q-tooltip
              :disable="$q.platform.is.mobile"
              v-close-popup
            >{{ mode === 'grid' ? 'List' : 'Grid' }}
            </q-tooltip>
          </q-btn>

          <q-btn
            color="primary"
            icon-right="archive"
            label="Exportar a csv"
            no-caps
            @click="exportTable"
          />
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              auto-width
            >
              <q-checkbox :disable="users.length === 0" class="float-left" v-if="col.label === 'ID'" v-model="checkAll"/>
              <span class="float-left" v-else>{{ col.label }}<br>
                <q-input debounce="300" outlined dense v-model="filters.name" v-if="col.label === 'Nombre'" type="text" style="min-width: 100px"/>
                <q-input debounce="300" outlined dense v-model="filters.email" style="min-width: 120px" v-else-if="col.label === 'Correo'" type="text"/>
                <q-select
                  outlined
                  dense
                  :options="[{label: 'Todos', value: ''}, {label: 'Habilitados', value: 1}, {label: 'Inhabilitados', value: 0}]"
                  v-model="filters.active" style="min-width: 100px"
                  v-else-if="col.label === 'Habilitado'"
                  type="text"
                  emit-value
                  map-options
                >
                  <template v-slot:selected-item="{ opt }">
                    <span style="margin-bottom: 20px;">{{ opt.label }}</span>
                  </template>
                </q-select>
              </span>
            </q-th>
            <q-th auto-width align="center">Opciones</q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              auto-width
            >
              <q-checkbox v-model="selected" :val="col.value" class="float-left" v-if="col.label === 'ID'"/>
              <q-img class="rounded-borders" width="40px" :ratio="1" v-if="col.label === 'Avatar' && col.value !== 'user.png'" :src="`${server}/storage/${props.cols[1].value}`" />
              <q-checkbox :disable="!user?.roles[0]?.permissions.find(p => p.name === 'habilitar-deshabilitar usuarios')" @click="setEnable(props.cols[0].value)" v-if="col.field === 'active'" :model-value="col.value" />
              <span v-if="col.field !== 'id' && col.field !== 'avatar' && col.field !== 'active'" class="float-left">{{ col.value }}</span>
            </q-td>
            <q-td auto-width align="center">
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'editar usuarios') || user?.id === props.cols[0].value" @click="edit(props.cols[0].value)" class="q-ml-sm bg-yellow-6 text-white" style="width: 35px">
                <q-icon size="xs" name="edit" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Editar Usuario.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'cambiar contraseña usuarios') || user?.id === props.cols[0].value" @click="changePasswordOpen(props.cols[0].value)" class="q-ml-sm bg-primary text-white" style="width: 35px">
                <q-icon size="xs" name="sync_lock" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Cambiar Contraseña.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'eliminar usuarios')" @click="deleteDialogOpen(props.cols[0].value)" class="q-ml-sm bg-negative text-white" style="width: 35px">
                <q-icon size="xs" name="delete_forever" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Eliminar Usuario.
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </template>
      </q-table>
    </q-card>
    <q-dialog v-model="new_user" persistent @before-hide="selected = []; usr = {active:true}">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">
            <span v-if="selected.length === 0"> Registrar Usuario</span>
            <span v-else> Editar Usuario</span>
            <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
          </div>
        </q-card-section>
        <q-separator inset></q-separator>
        <q-card-section style="max-height: 65vh" class="scroll">
          <q-form class="q-gutter-md">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Nombre</q-item-label>
                  <q-input dense outlined v-model="usr.name" label="Nombre"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Correo</q-item-label>
                  <q-input dense outlined v-model="usr.email" label="Correo"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Rol de Usuario</q-item-label>
                  <q-select
                    :readonly="!(user?.roles[0]?.permissions.find(p => p.name === 'editar usuarios') && user?.roles[0]?.permissions.find(p => p.name === 'listar roles'))"
                    dense
                    outlined
                    v-model="usr.role"
                    :options="roles"
                    emit-value
                    :option-label="role => role.name"
                    :option-value="role => role.id"
                    map-options
                    label="Rol de Usuario"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Tiendas</q-item-label>
                  <q-select
                    :readonly="!(user?.roles[0]?.permissions.find(p => p.name === 'editar usuarios') && user?.roles[0]?.permissions.find(p => p.name === 'listar tiendas'))"
                    dense
                    outlined
                    v-model="usr.stores"
                    :options="stores"
                    emit-value
                    :option-label="store => store.name"
                    :option-value="store => store.id"
                    map-options
                    multiple
                    use-chips
                    label="Tiendas"
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Avatar</q-item-label>
                  <q-file dense outlined v-model="usr.avatar" label="Avatar">
                    <template v-slot:prepend>
                      <q-icon name="cloud_upload" @click.stop.prevent />
                    </template>
                    <template v-slot:append>
                      <q-btn :disable="usr.avatar === null || usr.avatar === undefined" outlined unelevated icon="close" @click.stop.prevent="usr.avatar = null" class="cursor-pointer" style="margin-right: -10px; width: 40px" />
                    </template>
                  </q-file>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Habilitado</q-item-label>
                  <q-checkbox :disable="!user?.roles[0]?.permissions.find(p => p.name === 'habilitar-deshabilitar usuarios')" dense outlined v-model="usr.active" label="Habilitado"/>
                </q-item-section>
              </q-item>
              <q-item v-if="selected.length === 0">
                <q-item-section>
                  <q-item-label class="q-pb-xs">Contraseña</q-item-label>
                  <q-input type="password" dense outlined v-model="usr.password" label="Contraseña"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Confirmar Contraseña</q-item-label>
                  <q-input type="password" dense outlined v-model="usr.password_confirmation" label="Confirmar Contraseña"/>
                </q-item-section>
              </q-item>
            </q-list>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-teal">
          <q-btn v-if="selected.length === 0" @click="register" icon="save" label="Guardar" type="submit" color="primary"/>
          <q-btn v-else @click="update" icon="save" label="Actualizar" type="submit" color="primary"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
  <q-dialog v-model="changePasswordDialog" persistent @before-hide="selected = []">
    <q-card style="width: 300px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">
          <span> Cambiar Contraseña</span>
          <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
        </div>
      </q-card-section>
      <q-separator inset></q-separator>
      <q-card-section>
        <q-input v-model="newPassword.password" class="q-mb-md" type="password" dense label="Contraseña"></q-input>
        <q-input v-model="newPassword.password_confirmation" type="password" dense label="Confirmar Contraseña"></q-input>
      </q-card-section>
      <q-card-section>
        <q-btn @click="changePasswordConfirm" icon="save" class="full-width" color="primary" label="Guardar"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
  <delete-confirmation-dialog :visible="deleteDialog !== null" @hide="deleteDialogClose" @confirm="remove"/>
</template>

<script setup>
import {exportFile, useQuasar} from "quasar";
import {onMounted, reactive, ref, watch} from 'vue'
import {useUserStore} from "stores/user-store";
import {storeToRefs} from "pinia";
import {useAuthStore} from "stores/auth-store";
import {useRouter} from "vue-router";
import {server} from "boot/axios";
import {useRoleStore} from "stores/role-store";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import {useStoreStore} from "stores/store-store";

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const userStore = useUserStore();
const {users} = storeToRefs(userStore);
const roleStore = useRoleStore();
const storeStore = useStoreStore()
const {stores} = storeToRefs(storeStore);
const {roles} = storeToRefs(roleStore);
let loading = ref(false);

const columns = [
  { name: "id", align: "left", label: "ID", field: "id", sortable: true },
  { name: "avatar", align: "left", label: "Avatar", field: "avatar", sortable: true },
  { name: "name", align: "left", label: "Nombre",  field: "name", sortable: true },
  { name: "email", align: "left", label: "Correo", field: "email", sortable: true },
  { name: "active", align: "left", label: "Habilitado", field: "active", sortable: true },
];

const tableRef = ref()
const selected = ref([])
let filter = ref("")
let filters = reactive({
  name: "",
  email: "",
  active: "",
});
let usr = ref({
  active: true
})
let new_user = ref(false);
let mode = ref("list")
let pagination = ref({
  rowsPerPage: 10
});

const checkAll = ref(false)
watch(checkAll, () => {
  if (checkAll.value && users.value.length !== selected.value.length){
    users.value.forEach(app => {
      selected.value.push(app.id)
    })
  }else if (!checkAll.value){
    selected.value = []
  }
})

watch(selected, () => {
  checkAll.value = users.value.length === selected.value.length && users.value.length > 0;
})

onMounted(async () => {
  await userStore.getUsers(token.value)
  if (user.value?.roles[0]?.permissions.find(p => p.name === 'listar roles')){
    await roleStore.getRoles(token.value, null, false)
  }
  if (user.value?.roles[0]?.permissions.find(p => p.name === 'listar tiendas')){
    await storeStore.getStores(token.value, null, false)
  }
})

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0 ? formatFn(val) : val;

  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}
const exportTable = () => {
  // naive encoding to csv format
  const content = [columns.map(col => wrapCsvValue(col.label))]
    .concat(
      users.value.map(row =>
        columns
          .map(col =>
            wrapCsvValue(
              typeof col.field === "function"
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format
            )
          )
          .join(",")
      )
    )
    .join("\r\n");

  const status = exportFile("usuarios.csv", content, "text/csv");

  if (status !== true) {
    $q.notify({
      message: "Browser denied file download...",
      color: "negative",
      icon: "warning"
    });
  }
}

watch(filters, async () => {
  loading.value = true;
  const url = `/api/users?name=${filters.name}&email=${filters.email}&active=${filters.active}`
  await userStore.getUsers(token.value, url, false)
    .finally(() => loading.value = false);
})

const register = async () => {
  const registered = await userStore.postUser(token.value, usr.value)
  if (registered){
    new_user.value = false;
    loading.value = true;
    await userStore.getUsers(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const edit = (id) => {
  const edit = users.value.find(u => u.id === id);
  usr.value.name = edit.name;
  usr.value.email = edit.email;
  usr.value.active = edit.active;
  usr.value.role = edit.roles[0].id
  usr.value.stores = edit.stores.map(st => st.id);
  selected.value = [id];
  new_user.value = true;
}

const update = async () => {
  const updated = await userStore.putUser(token.value, selected.value[0], usr.value)
  if (updated){
    new_user.value = false;
    loading.value = true;
    selected.value = [];
    await userStore.getUsers(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

let deleteDialog = ref(null)
const deleteDialogOpen = (id) => {
  deleteDialog.value = id;
}

const deleteDialogClose = () => {
  deleteDialog.value = null;
}

const remove = async () => {
  const deleted = await userStore.deleteUser(token.value, deleteDialog.value)
  if (deleted){
    deleteDialog.value = null;
    loading.value = true;
    await userStore.getUsers(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const setEnable = async (id) => {
  if (user.value?.roles[0]?.permissions.find(p => p.name === 'habilitar-deshabilitar usuarios')){
    const res = await userStore.enableDisableUser(token.value, id)
    if (res){
      loading.value = true;
      await userStore.getUsers(token.value, null, false)
        .finally(() => loading.value = false);
    }
  }
}

let changePasswordDialog = ref(false)
const newPassword = reactive({
  password: null,
  password_confirmation: null
})
const changePasswordOpen = (id) => {
  changePasswordDialog.value = true;
  selected.value = [id];
}

const changePasswordConfirm = async () => {
  const res = await userStore.changePasswordUser(token.value, selected.value[0], newPassword);
  if (res){
    changePasswordDialog.value = false;
    selected.value = [];
  }
}
</script>

