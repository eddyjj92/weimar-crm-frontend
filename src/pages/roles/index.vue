<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-table
        ref="tableRef"
        title="Roles del Sistema"
        :rows="roles"
        :hide-header="mode === 'grid'"
        :columns="columns"
        row-key="name"
        :grid="mode === 'grid'"
        :filter="filter"
        :pagination:sync="pagination"
      >
        <template v-slot:top-right="props">
          <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'crear roles')" @click="dialog = true;" icon="add" outline color="primary" label="Registrar" class="q-mr-xs"/>

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
              <q-checkbox :disable="roles.length === 0" class="float-left" v-if="col.label === 'ID'" v-model="checkAll"/>
              <span class="float-left" v-else>{{ col.label }}<br>
                <q-input debounce="300" outlined dense v-model="filters.name" v-if="col.label === 'Nombre'" type="text"/>
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
              <q-checkbox @click="setEnable(props.cols[0].value)" v-if="col.field === 'active'" :model-value="col.value" />
              <span v-if="col.field !== 'id' && col.field !== 'avatar' && col.field !== 'active'" class="float-left">{{ col.value }}</span>
            </q-td>
            <q-td auto-width align="center">
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'editar roles')" @click="edit(props.cols[0].value)" class="q-ml-sm bg-yellow-6 text-white" style="width: 35px">
                <q-icon size="xs" name="edit" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Editar Rol.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'eliminar roles')" @click="deleteDialogOpen(props.cols[0].value)" class="q-ml-sm bg-negative text-white" style="width: 35px">
                <q-icon size="xs" name="delete_forever" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Eliminar Rol.
                </q-tooltip>
              </q-btn>
              <template v-if="!(user?.roles[0]?.permissions.find(p => p.name === 'editar roles' && user?.roles[0]?.permissions.find(p => p.name === 'eliminar roles')))">
                <span>-</span>
              </template>
            </q-td>
          </q-tr>
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </template>
      </q-table>
    </q-card>
    <q-dialog v-model="dialog" persistent @before-hide="selected = []; role = {permissions: []}">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">
            <span v-if="selected.length === 0"> Registrar Rol de Usuario</span>
            <span v-else> Editar Rol de Usuario</span>
            <q-btn round flat dense icon="close" class="float-right" color="grey-8" v-close-popup></q-btn>
          </div>
        </q-card-section>
        <q-separator inset></q-separator>
        <q-card-section style="max-height: 70vh" class="scroll">
          <q-form class="q-gutter-md">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Nombre</q-item-label>
                  <q-input dense outlined v-model="role.name" label="Nombre"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="full-width">
                  <q-item-label class="text-center text-h5">Permisos del Sistema</q-item-label>
                </q-item-section>
              </q-item>
              <q-item style="overflow-x: auto; white-space: nowrap;">
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">Usuarios</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('usuarios'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">Roles</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('roles'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">Colores</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('colores'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
              </q-item>
              <q-item style="overflow-x: auto; white-space: nowrap;">
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">Grupos</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('grupos'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">IVAs</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('ivas'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
                <q-item-section style="display: flex !important; align-items: flex-start !important;flex-direction: column;justify-content: flex-start;">
                  <span class="text-h6">Artículos</span>
                  <q-checkbox @click="setPermission(perm.id)" class="text-capitalize" v-for="(perm, i) in permissions.filter(p => p.name.includes('artículos'))" :key="i" :model-value="role.permissions.includes(perm.id)" :label="perm.name" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-form>
        </q-card-section>
        <q-separator inset></q-separator>
        <q-card-actions align="right" class="text-teal">
          <q-btn v-if="selected.length === 0" @click="register" icon="save" label="Guardar" type="submit" color="primary"/>
          <q-btn v-else @click="update" icon="save" label="Actualizar" type="submit" color="primary"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
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

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const roleStore = useRoleStore();
const {roles, permissions} = storeToRefs(roleStore);
let loading = ref(false);

const columns = [
  { name: "id", align: "left", label: "ID",  field: "id", sortable: true },
  { name: "name", align: "left", label: "Nombre",  field: "name", sortable: true },
];

const tableRef = ref()
const selected = ref([])
let filter = ref("")
let filters = reactive({
  name: "",
});
let role = ref({
  permissions: []
})
let dialog = ref(false);
let mode = ref("list")
let pagination = ref({
  rowsPerPage: 10
});

const checkAll = ref(false)
watch(checkAll, () => {
  if (checkAll.value && roles.value.length !== selected.value.length){
    roles.value.forEach(role => {
      selected.value.push(role.id)
    })
  }else if (!checkAll.value){
    selected.value = []
  }
})

watch(selected, () => {
  checkAll.value = roles.value.length === selected.value.length && roles.value.length > 0;
})

onMounted(async () => {
  await roleStore.getRoles(token.value, null, !roleStore.fetched)
  await roleStore.getPermissions(token.value, null, false)
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
      roles.value.map(row =>
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

  const status = exportFile("roles.csv", content, "text/csv");

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
  const url = `/api/roles?name=${filters.name}`
  await roleStore.getRoles(token.value, url, false)
    .finally(() => loading.value = false);
})

const register = async () => {
  const registered = await roleStore.postRole(token.value, role.value)
  if (registered){
    dialog.value = false;
    loading.value = true;
    role.value = {};
    await roleStore.getRoles(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const edit = (id) => {
  const edit = roles.value.find(u => u.id === id);
  role.value.name = edit.name;
  role.value.permissions = edit.permissions.map(p => p.id)
  selected.value = [id];
  dialog.value = true;
}

const update = async () => {
  const updated = await roleStore.putRole(token.value, selected.value[0], role.value)
  if (updated){
    dialog.value = false;
    loading.value = true;
    selected.value = [];
    await roleStore.getRoles(token.value, null, false)
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
  const deleted = await roleStore.deleteRole(token.value, deleteDialog.value)
  if (deleted){
    deleteDialog.value = null;
    loading.value = true;
    await roleStore.getRoles(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const setPermission = (id) => {
  if (role.value.permissions.includes(id)){
    role.value.permissions = role.value.permissions.filter(p_id => p_id !== id);
  }else {
    role.value.permissions.push(id)
  }
}

</script>

