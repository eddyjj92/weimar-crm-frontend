<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-table
        ref="tableRef"
        title="Colores"
        :rows="colors"
        :hide-header="mode === 'grid'"
        :columns="columns"
        row-key="name"
        :grid="mode === 'grid'"
        :filter="filter"
        :pagination:sync="pagination"
      >
        <template v-slot:top-right="props">
          <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'crear colores')" @click="dialog = true;" icon="add" outline color="primary" label="Registrar" class="q-mr-xs"/>

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
              <q-checkbox :disable="colors.length === 0" class="float-left" v-if="col.label === 'ID'" v-model="checkAll"/>
              <span class="float-left" v-else>{{ col.label }}<br>
                <q-input debounce="300" outlined dense v-model="filters.name" v-if="col.label === 'Nombre'" type="text"/>
                <q-input debounce="300" outlined dense v-model="filters.name" v-if="col.label === 'Código Hexadecimal'" type="text"/>
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
              <span v-if="col.field === 'hexadecimal_code'" class="float-left flex flex-center">
                {{ col.value }}
                <div style="display: inline-block; width: 50px; height: 20px; margin-left: 10px;border-radius: 5px; border: 1px solid" :style="`background-color: ${col.value}`"></div>
              </span>
              <span v-if="col.field !== 'id' && col.field !== 'hexadecimal_code'" class="float-left">{{ col.value }}</span>
            </q-td>
            <q-td auto-width align="center">
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'editar colores')" @click="edit(props.cols[0].value)" class="q-ml-sm bg-yellow-6 text-white" style="width: 35px">
                <q-icon size="xs" name="edit" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Editar Color.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'eliminar colores')" @click="deleteDialogOpen(props.cols[0].value)" class="q-ml-sm bg-negative text-white" style="width: 35px">
                <q-icon size="xs" name="delete_forever" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Eliminar Color.
                </q-tooltip>
              </q-btn>
              <template v-if="!(user?.roles[0]?.permissions.find(p => p.name === 'editar colores' && user?.roles[0]?.permissions.find(p => p.name === 'eliminar colores')))">
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
    <q-dialog v-model="dialog" persistent @before-hide="selected = []; color = {}">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">
            <span v-if="selected.length === 0"> Registrar Color</span>
            <span v-else> Editar Color</span>
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
                  <q-input dense outlined v-model="color.name" label="Nombre"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Codigo Hexadecimal</q-item-label>
                  <q-input
                    outlined
                    dense
                    v-model="color.hexadecimal_code"
                    :style="`background-color: ${color.hexadecimal_code}`"
                    readonly
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="color.hexadecimal_code" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
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
import {storeToRefs} from "pinia";
import {useAuthStore} from "stores/auth-store";
import {server} from "boot/axios";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import {useColorStore} from "stores/color-store";

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const colorStore = useColorStore();
const {colors} = storeToRefs(colorStore);
let loading = ref(false);

const columns = [
  { name: "id", align: "left", label: "ID",  field: "id", sortable: true },
  { name: "name", align: "left", label: "Nombre",  field: "name", sortable: true },
  { name: "hexadecimal_code", align: "left", label: "Código Hexadecimal",  field: "hexadecimal_code", sortable: true },
];

const tableRef = ref()
const selected = ref([])
let filter = ref("")
let filters = reactive({
  name: "",
});
let color = ref({})
let dialog = ref(false);
let mode = ref("list")
let pagination = ref({
  rowsPerPage: 10
});

const checkAll = ref(false)
watch(checkAll, () => {
  if (checkAll.value && colors.value.length !== selected.value.length){
    colors.value.forEach(color => {
      selected.value.push(color.id)
    })
  }else if (!checkAll.value){
    selected.value = []
  }
})

watch(selected, () => {
  checkAll.value = colors.value.length === selected.value.length && colors.value.length > 0;
})

onMounted(async () => {
  await colorStore.getColors(token.value, null)
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
      colors.value.map(row =>
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

  const status = exportFile("colors.csv", content, "text/csv");

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
  const url = `/api/colors?name=${filters.name}`
  await colorStore.getColors(token.value, url, false)
    .finally(() => loading.value = false);
})

const register = async () => {
  const registered = await colorStore.postColor(token.value, color.value)
  if (registered){
    dialog.value = false;
    loading.value = true;
    color.value = {};
    await colorStore.getColors(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const edit = (id) => {
  const edit = colors.value.find(u => u.id === id);
  color.value.name = edit.name;
  color.value.hexadecimal_code = edit.hexadecimal_code;
  selected.value = [id];
  dialog.value = true;
}

const update = async () => {
  const updated = await colorStore.putColor(token.value, selected.value[0], color.value)
  if (updated){
    dialog.value = false;
    loading.value = true;
    selected.value = [];
    await colorStore.getColors(token.value, null, false)
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
  const deleted = await colorStore.deleteColor(token.value, deleteDialog.value)
  if (deleted){
    deleteDialog.value = null;
    loading.value = true;
    await colorStore.getColors(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

</script>

