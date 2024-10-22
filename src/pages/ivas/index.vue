<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-table
        ref="tableRef"
        title="IVA"
        :rows="ivas"
        :hide-header="mode === 'grid'"
        :columns="columns"
        row-key="name"
        :grid="mode === 'grid'"
        :filter="filter"
        :pagination:sync="pagination"
      >
        <template v-slot:top-right="props">
          <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'crear ivas')" @click="dialog = true;" icon="add" outline color="primary" label="Registrar" class="q-mr-xs"/>

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
              <q-checkbox :disable="ivas.length === 0" class="float-left" v-if="col.label === 'ID'" v-model="checkAll"/>
              <span class="float-left" v-else>{{ col.label }}<br>
                <q-input debounce="300" outlined dense v-model="filters.percent" v-if="col.label === 'Porciento'" type="text"/>
                <q-input debounce="300" outlined dense v-model="filters.description" v-if="col.label === 'Descripción'" type="text"/>
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
              <span v-if="col.field !== 'id'" class="float-left">{{ col.value }}</span>
            </q-td>
            <q-td auto-width align="center">
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'editar ivas')" @click="edit(props.cols[0].value)" class="q-ml-sm bg-yellow-6 text-white" style="width: 35px">
                <q-icon size="xs" name="edit" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Editar IVA.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'eliminar ivas')" @click="deleteDialogOpen(props.cols[0].value)" class="q-ml-sm bg-negative text-white" style="width: 35px">
                <q-icon size="xs" name="delete_forever" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Eliminar IVA.
                </q-tooltip>
              </q-btn>
              <template v-if="!(user?.roles[0]?.permissions.find(p => p.name === 'editar ivas' && user?.roles[0]?.permissions.find(p => p.name === 'eliminar ivas')))">
                <span>-</span>
              </template>
            </q-td>
          </q-tr>
          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" group="primary" />
          </q-inner-loading>
        </template>
      </q-table>
    </q-card>
    <q-dialog v-model="dialog" persistent @before-hide="selected = []; group = {}">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">
            <span v-if="selected.length === 0"> Registrar IVA</span>
            <span v-else> Editar IVA</span>
            <q-btn round flat dense icon="close" class="float-right" group="grey-8" v-close-popup></q-btn>
          </div>
        </q-card-section>
        <q-separator inset></q-separator>
        <q-card-section style="max-height: 70vh" class="scroll">
          <q-form class="q-gutter-md">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Porciento</q-item-label>
                  <q-input dense outlined v-model="iva.percent" label="Porciento"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Descripción</q-item-label>
                  <q-input type="textarea" dense outlined v-model="iva.description" label="Descripción"/>
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
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import {useGroupStore} from "stores/group-store";
import {useIvaStore} from "stores/iva-store";

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const ivaStore = useIvaStore();
const {ivas} = storeToRefs(ivaStore);
let loading = ref(false);

const columns = [
  { name: "id", align: "left", label: "ID",  field: "id", sortable: true },
  { name: "percent", align: "left", label: "Porciento",  field: "percent", sortable: true, format: (val, row) => `${val}%`, } ,
  { name: "description", align: "left", label: "Descripción",  field: "description", sortable: true },
];

const tableRef = ref()
const selected = ref([])
let filter = ref("")
let filters = reactive({
  percent: "",
  description: "",
});
let iva = ref({})
let dialog = ref(false);
let mode = ref("list")
let pagination = ref({
  rowsPerPage: 10
});

const checkAll = ref(false)
watch(checkAll, () => {
  if (checkAll.value && ivas.value.length !== selected.value.length){
    ivas.value.forEach(iva => {
      selected.value.push(iva.id)
    })
  }else if (!checkAll.value){
    selected.value = []
  }
})

watch(selected, () => {
  checkAll.value = ivas.value.length === selected.value.length && ivas.value.length > 0;
})

onMounted(async () => {
  await ivaStore.getIvas(token.value, null)
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
      ivas.value.map(row =>
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

  const status = exportFile("iva.csv", content, "text/csv");

  if (status !== true) {
    $q.notify({
      message: "Browser denied file download...",
      group: "negative",
      icon: "warning"
    });
  }
}

watch(filters, async () => {
  loading.value = true;
  const url = `/api/ivas?percent=${filters.percent}&description=${filters.description}`
  await ivaStore.getIvas(token.value, url, false)
    .finally(() => loading.value = false);
})

const register = async () => {
  const registered = await ivaStore.postIva(token.value, iva.value)
  if (registered){
    dialog.value = false;
    loading.value = true;
    iva.value = {};
    await ivaStore.getIvas(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const edit = (id) => {
  const edit = ivas.value.find(u => u.id === id);
  iva.value.percent = edit.percent;
  iva.value.description = edit.description;
  selected.value = [id];
  dialog.value = true;
}

const update = async () => {
  const updated = await ivaStore.putIva(token.value, selected.value[0], iva.value)
  if (updated){
    dialog.value = false;
    loading.value = true;
    selected.value = [];
    await ivaStore.getIvas(token.value, null, false)
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
  const deleted = await ivaStore.deleteIva(token.value, deleteDialog.value)
  if (deleted){
    deleteDialog.value = null;
    loading.value = true;
    await ivaStore.getIvas(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

</script>

