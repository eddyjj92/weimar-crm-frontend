<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-table
        ref="tableRef"
        title="Productos"
        :rows="items"
        :hide-header="mode === 'grid'"
        :columns="columns"
        row-key="name"
        :grid="mode === 'grid'"
        :filter="filter"
        :pagination:sync="pagination"
        class="my-sticky-last-column-table"
      >
        <template v-slot:top-right="props">
          <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'crear productos')" @click="dialog = true;" icon="add" outline color="primary" label="Registrar" class="q-mr-xs"/>

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
              <q-checkbox :disable="items.length === 0" class="float-left" v-if="col.label === 'ID'" v-model="checkAll"/>
              <span class="float-left" v-else>{{ col.label }}<br>
                <q-input debounce="300" outlined dense v-model="filters.code" v-if="col.label === 'Nombre'" type="text"/>
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
              <q-img class="rounded-borders" width="40px" :ratio="1" v-if="col.label === 'Imagen' && col.value !== 'user.png'" :src="`${server}/storage/${props.cols[1].value}`" />
              <q-checkbox @click="setActive(props.cols[0].value)" v-if="col.field === 'active'" :model-value="col.value" />
              <span v-if="col.field !== 'id' && col.field !== 'image' && col.field !== 'active'" class="float-left">{{ col.value }}</span>
            </q-td>
            <q-td auto-width align="center">
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'editar productos')" @click="edit(props.cols[0].value)" class="q-ml-sm bg-yellow-6 text-white" style="width: 35px">
                <q-icon size="xs" name="edit" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Editar Producto.
                </q-tooltip>
              </q-btn>
              <q-btn v-if="user?.roles[0]?.permissions.find(p => p.name === 'eliminar productos')" @click="deleteDialogOpen(props.cols[0].value)" class="q-ml-sm bg-negative text-white" style="width: 35px">
                <q-icon size="xs" name="delete_forever" />
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                  Eliminar Producto.
                </q-tooltip>
              </q-btn>
              <template v-if="!(user?.roles[0]?.permissions.find(p => p.name === 'editar productos' && user?.roles[0]?.permissions.find(p => p.name === 'eliminar productos')))">
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
    <q-dialog v-model="dialog" persistent @before-hide="selected = []; item = {promotion: false, active: true}">
      <q-card style="width: 700px; max-width: 85vw;">
        <q-card-section>
          <div class="text-h6">
            <span v-if="selected.length === 0"> Registrar Producto</span>
            <span v-else> Editar Producto</span>
            <q-btn round flat dense icon="close" class="float-right" group="grey-8" v-close-popup></q-btn>
          </div>
        </q-card-section>
        <q-separator inset></q-separator>
        <q-card-section style="max-height: 65vh" class="scroll">
          <q-form class="q-gutter-md">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Nombre</q-item-label>
                  <q-input dense outlined v-model="item.name" label="Nombre"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Grupo</q-item-label>
                  <q-select
                    @filter="filterSelectGroups"
                    @mouseenter="groups.length === 0 && !groupStore.fetched ? groupStore.getGroups(token) : null"
                    dense
                    outlined
                    v-model="item.group_id"
                    :options="selectGroups"
                    use-input
                    emit-value
                    :option-label="group => group.name"
                    :option-value="group => group.id"
                    map-options
                    label="Grupo"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Descripción</q-item-label>
                  <q-input dense outlined v-model="item.description" label="Descripción"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Colores</q-item-label>
                  <q-select
                    @filter="filterSelectColors"
                    @mouseenter="colors.length === 0 && !colorStore.fetched ? colorStore.getColors(token) : null"
                    dense
                    outlined
                    v-model="item.colors"
                    :options="selectColors"
                    use-input
                    emit-value
                    :option-label="color => color.name"
                    :option-value="color => color.id"
                    map-options
                    use-chips
                    multiple
                    label="Colores"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Tallas</q-item-label>
                  <q-select
                    @filter="filterSelectSizes"
                    @mouseenter="sizes.length === 0 && !sizeStore.fetched ? sizeStore.getSizes(token) : null"
                    dense
                    outlined
                    v-model="item.sizes"
                    :options="selectSizes"
                    use-input
                    emit-value
                    :option-label="size => size.name"
                    :option-value="size => size.id"
                    map-options
                    use-chips
                    multiple
                    label="Tallas"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">% Ganancia Mínima</q-item-label>
                  <q-input dense outlined v-model="item.min_profit_percent" label="% Ganancia Mínima"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">% Ganancia Máxima</q-item-label>
                  <q-input dense outlined v-model="item.max_profit_percent" label="% Ganancia Máxima"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Precio de Compra</q-item-label>
                  <q-input dense outlined v-model="item.last_purchase_price" label="Precio de Compra"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Precio de Venta</q-item-label>
                  <q-input dense outlined v-model="item.last_sale_price" label="Precio de Venta"/>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Promoción</q-item-label>
                  <q-checkbox dense outlined v-model="item.promotion" label="Promoción" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Activo</q-item-label>
                  <q-checkbox dense outlined v-model="item.active" label="Activo"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="q-pb-xs">IVA</q-item-label>
                  <q-select
                    @filter="filterSelectIvas"
                    @mouseenter="ivas.length === 0 && !ivaStore.fetched ? ivaStore.getIvas(token) : null"
                    dense
                    use-input
                    outlined
                    v-model="item.iva_id"
                    :options="selectIvas"
                    emit-value
                    :option-label="iva => iva.description"
                    :option-value="iva => iva.id"
                    map-options
                    label="IVA"
                    style="max-width: 100%"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay resultados
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="q-pb-xs">Imagen</q-item-label>
                  <q-file dense outlined v-model="item.image" label="Imagen">
                    <template v-slot:prepend>
                      <q-icon name="cloud_upload" @click.stop.prevent />
                    </template>
                    <template v-slot:append>
                      <q-btn :disable="item.image === null || item.image === undefined" outlined unelevated icon="close" @click.stop.prevent="item.image = null" class="cursor-pointer" style="margin-right: -10px; width: 40px" />
                    </template>
                  </q-file>
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
import {useItemStore} from "stores/item-store";
import {useGroupStore} from "stores/group-store";
import {useColorStore} from "stores/color-store";
import {useIvaStore} from "stores/iva-store";
import {server} from "boot/axios";
import {useSizeStore} from "stores/size-store";

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const itemStore = useItemStore();
const {items} = storeToRefs(itemStore);
const groupStore = useGroupStore()
const {groups} = storeToRefs(groupStore)
const colorStore = useColorStore()
const {colors} = storeToRefs(colorStore)
const ivaStore = useIvaStore()
const {ivas} = storeToRefs(ivaStore)
const sizeStore = useSizeStore();
const {sizes} = storeToRefs(sizeStore);
let loading = ref(false);

let selectGroups = ref(groups.value)
let selectColors = ref(colors.value)
let selectSizes = ref(sizes.value)
let selectIvas = ref(ivas.value)


const columns = [
  { name: "id", align: "left", label: "ID",  field: "id", sortable: true },
  { name: "image", align: "left", label: "Imagen",  field: "image", sortable: true },
  { name: "name", align: "left", label: "Nombre",  field: "name", sortable: true },
  { name: "grupo", align: "left", label: "Grupo",  field: "group", sortable: true, format: (val, row) => `${val.name}`, },
  { name: "colors", align: "left", label: "Colores",  field: "colors", sortable: true, format: (val, row) => `${val.map(c => c.name)}`, },
  { name: "sizes", align: "left", label: "Tallas",  field: "sizes", sortable: true, format: (val, row) => `${val.map(c => c.name)}`, },
  { name: "last_purchase_price", align: "left", label: "Precio de Compra",  field: "last_purchase_price", sortable: true, format: (val, row) => `$${val}`, },
  { name: "last_sale_price", align: "left", label: "Precio de Venta",  field: "last_sale_price", sortable: true, format: (val, row) => `$${val}`, },
  { name: "promotion", align: "left", label: "Promoción",  field: "promotion", sortable: true, format: (val, row) => val ? 'Si' : 'No', },
  { name: "active", align: "left", label: "Activo",  field: "active", sortable: true },
  { name: "iva", align: "left", label: "IVA",  field: "iva", sortable: true, format: (val, row) => `(${val.percent}) ${val.description}`, },
];

const tableRef = ref()
const selected = ref([])
let filter = ref("")
let filters = reactive({
  name: "",
  description: "",
});
let item = ref({
  active: true,
  promotion: false,
})
let dialog = ref(false);
let mode = ref("list")
let pagination = ref({
  rowsPerPage: 10
});

const checkAll = ref(false)
watch(checkAll, () => {
  if (checkAll.value && items.value.length !== selected.value.length){
    items.value.forEach(item => {
      selected.value.push(item.id)
    })
  }else if (!checkAll.value){
    selected.value = []
  }
})

watch(selected, () => {
  checkAll.value = items.value.length === selected.value.length && items.value.length > 0;
})

onMounted(async () => {
  await itemStore.getItems(token.value, null)
  await colorStore.getColors(token.value, null, false, false)
  await sizeStore.getSizes(token.value, null, false, false)
  await groupStore.getGroups(token.value, null, false, false)
  await ivaStore.getIvas(token.value, null, false, true)
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
      items.value.map(row =>
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

  const status = exportFile("items.csv", content, "text/csv");

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
  const url = `/api/items?name=${filters.name}&description=${filters.description}`
  await itemStore.getItems(token.value, url, false)
    .finally(() => loading.value = false);
})

const register = async () => {
  const registered = await itemStore.postItem(token.value, item.value)
  if (registered){
    dialog.value = false;
    loading.value = true;
    item.value = {};
    await itemStore.getItems(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const edit = (id) => {
  const edit = items.value.find(u => u.id === id);
  item.value.name = edit.name;
  item.value.group_id = edit.group_id;
  item.value.color_id = edit.color_id;
  item.value.min_profit_percent = edit.min_profit_percent;
  item.value.max_profit_percent = edit.max_profit_percent;
  item.value.price = edit.price;
  item.value.promotion = edit.promotion;
  item.value.active = edit.active;
  item.value.iva_id = edit.iva_id;
  item.value.description = edit.description;
  item.value.colors = edit.colors.map(c => c.id);
  item.value.sizes = edit.sizes.map(s => s.id);
  selected.value = [id];
  dialog.value = true;
}

const update = async () => {
  const updated = await itemStore.putItem(token.value, selected.value[0], item.value)
  if (updated){
    dialog.value = false;
    loading.value = true;
    selected.value = [];
    await itemStore.getItems(token.value, null, false)
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
  const deleted = await itemStore.deleteItem(token.value, deleteDialog.value)
  if (deleted){
    deleteDialog.value = null;
    loading.value = true;
    await itemStore.getItems(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

const filterSelectGroups = (val, update) => {
  if (val === '') {
    update(() => {
      selectGroups.value = groups.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    selectGroups.value = groups.value.filter(v => v.description.toLowerCase().indexOf(needle) > -1)
  });
}

const filterSelectColors = (val, update) => {
  if (val === '') {
    update(() => {
      selectColors.value = colors.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    selectColors.value = colors.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
  });
}

const filterSelectSizes = (val, update) => {
  if (val === '') {
    update(() => {
      selectSizes.value = sizes.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    selectSizes.value = sizes.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
  });
}

const filterSelectIvas = (val, update) => {
  if (val === '') {
    update(() => {
      selectIvas.value = ivas.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    selectIvas.value = ivas.value.filter(v => v.description.toLowerCase().indexOf(needle) > -1)
  });
}


const setActive = async (id) => {
  const res = await itemStore.setActiveItem(token.value, id)
  if (res){
    loading.value = true;
    await itemStore.getItems(token.value, null, false)
      .finally(() => loading.value = false);
  }
}

</script>

