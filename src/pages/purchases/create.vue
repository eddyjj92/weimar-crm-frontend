<template>
  <q-page class="q-pa-sm full-height row">
    <q-card class="flex-grow col-auto q-px-none" style="max-height: 180px">
      <q-card-section class="full-width  q-pt-sm q-pb-xs">
        <span class="text-h6">Nueva Compra</span>
      </q-card-section>
      <q-card-section class="q-pt-none q-px-none">
        <q-item class="q-py-xs">
          <q-item-section style="min-width: 25%">
            <label for="" class="text-bold" style="font-size: 12px">Proveedor</label>
            <q-select
              outlined
              v-model="purchase.entity_id"
              :options="suppliers"
              option-label="trade_name"
              option-value="id"
              emit-value
              map-options
              dense
            />
          </q-item-section>
          <q-item-section>
            <label for="" class="text-bold" style="font-size: 12px">Factura</label>
            <q-input outlined v-model="purchase.invoice" dense/>
          </q-item-section>
          <q-item-section>
            <label for="" class="text-bold" style="font-size: 12px">Forma de Pago</label>
            <q-select
              outlined
              v-model="purchase.payment_shape"
              :options="payment_shapes"
              map-options
              emit-value
              dense
            />
          </q-item-section>
          <q-item-section>
            <label for="" class="text-bold" style="font-size: 12px">Plazo</label>
            <q-input outlined v-model="purchase.term" dense/>
          </q-item-section>
          <q-item-section>
            <label for="" class="text-bold" style="font-size: 12px">Fecha</label>
            <q-input outlined v-model="purchase.invoice_date" type="date" dense/>
          </q-item-section>
        </q-item>
        <q-item class="q-py-xs">
          <q-item-section style="min-width: 25%">
            <label for="" class="text-bold" style="font-size: 12px">Producto</label>
            <q-select
              ref="itemSelect"
              outlined
              v-model="purchase.item_id"
              :options="products"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              dense
              use-input
              @click="purchase.item_id = null;purchase.color_id = null"
              @filter="productFilter"
            >
              <template v-slot:before-options>
                <q-markup-table separator="cell" flat bordered dense>
                  <thead>
                  <tr class="bg-grey-4">
                    <th class="text-left" style="width: 120px">Producto</th>
                    <th class="text-left" style="width: 200px">Descripción</th>
                    <th class="text-left" style="width: 50px">% IVA</th>
                    <th class="text-left" style="width: 50px">P. Compra</th>
                    <th class="text-left" style="width: 50px">P. Venta</th>
                  </tr>
                  </thead>
                  <tbody>
                  <template v-for="option in products" :key="option.id">
                    <tr @click="purchase.item_id = option.id; itemSelect.hidePopup()">
                      <td style="width: 120px">{{ option.name }}</td>
                      <td style="width: 200px">{{ option.description }}</td>
                      <td style="width: 50px">{{ option.iva_id }}</td>
                      <td style="width: 50px">{{ option.price }}</td>
                      <td style="width: 50px">{{ option.sell_price }}</td>
                    </tr>
                  </template>
                  </tbody>
                </q-markup-table>
              </template>
              <template v-slot:option></template>
            </q-select>
          </q-item-section>
          <q-item-section style="min-width: 14%">
            <q-item class="q-pa-none">
              <q-item-section style="min-width: 60%">
                <label for="" class="text-bold" style="font-size: 12px">Color</label>
                <q-select
                  outlined
                  v-model="purchase.color_id"
                  :options="items.find(i => i.id === purchase.item_id)?.colors"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  dense
                />
              </q-item-section>
              <q-item-section>
                <label for="" class="text-bold" style="font-size: 12px">% IVA</label>
                <q-input outlined dense/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section  style="min-width: 20%">
            <q-item class="q-pa-none">
              <q-item-section>
                <label for="" class="text-bold" style="font-size: 12px">Precio Compra</label>
                <q-input outlined dense/>
              </q-item-section>
              <q-item-section style="min-width: 55%">
                <label for="" class="text-bold" style="font-size: 12px">Precio Venta + IVA</label>
                <q-input outlined dense/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section style="min-width: 28%">
            <q-item class="q-pa-none">
              <q-item-section>
                <label for="" class="text-bold" style="font-size: 12px">% Desc.</label>
                <q-input outlined dense/>
              </q-item-section>
              <q-item-section style="min-width: 40%">
                <label for="" class="text-bold" style="font-size: 12px">Precio comp. final*</label>
                <q-input outlined  dense/>
              </q-item-section>
              <q-item-section style="min-width: 38%">
                <label for="" class="text-bold" style="font-size: 12px">Precio comp. + iva*</label>
                <q-input outlined dense/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section>
            <q-item class="q-pa-none">
              <q-item-section>
                <q-btn color="primary" icon="pan_tool_alt" dense class="q-mt-md">
                  <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
                    <strong>Tallas</strong>
                    (<q-icon name="keyboard_arrow_up"/>)
                  </q-tooltip>
                </q-btn>
              </q-item-section>
              <q-item-section>
                <label for="" class="text-bold" style="font-size: 12px">Cantidad</label>
                <q-input outlined dense class="input-box"/>
              </q-item-section>
            </q-item>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm q-pa-none flex-grow">
      <q-card-section class="full-width scroll q-pa-none">
        <q-markup-table separator="cell" flat bordered dense>
          <thead>
            <tr class="bg-grey-4">
              <th class="text-left">Producto</th>
              <th class="text-right">Descripcion</th>
              <th class="text-right">Talla</th>
              <th class="text-right">Color</th>
              <th class="text-right">%Iva</th>
              <th class="text-right">P/Compra</th>
              <th class="text-right">P/Venta</th>
              <th class="text-right">% Desc</th>
              <th class="text-right">P/Final</th>
              <th class="text-right">P/Iva</th>
              <th class="text-right">Cant</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dt, i) in purchase.details" :key="i">
              <td class="text-left">{{dt.item_id}}</td>
              <td class="text-right">Descripcion</td>
              <td class="text-right">Talla</td>
              <td class="text-right">Color</td>
              <td class="text-right">%Iva</td>
              <td class="text-right">P/Compra</td>
              <td class="text-right">P/Venta</td>
              <td class="text-right">% Desc</td>
              <td class="text-right">P/Final</td>
              <td class="text-right">P/Iva</td>
              <td class="text-right">Cant</td>
              <td class="text-right">Subtotal</td>
              <td class="text-right">Eliminar</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-sm">
      <q-card-section>
        <q-item>
          <q-item-section>
            <q-input outlined dense label="Subtotal"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="Descuento"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="IVA"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="Total"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="Valor abono"></q-input>
          </q-item-section>
          <q-item-section>
            <q-btn outline icon="save" color="primary" dense>Guardar</q-btn>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import {useQuasar} from "quasar";
import {onMounted, ref} from 'vue'
import {storeToRefs} from "pinia";
import {useAuthStore} from "stores/auth-store";
import {usePurchaseStore} from "stores/purchase-store.js";
import {useIvaStore} from "stores/iva-store.js";
import {useItemStore} from "stores/item-store.js";
import {useRouter} from "vue-router";

const $router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const purchaseStore = usePurchaseStore();
const {purchases, suppliers, payment_shapes, purchase_states} = storeToRefs(purchaseStore);
const ivaStore = useIvaStore();
const {ivas} = storeToRefs(ivaStore);
const itemStore = useItemStore()
const {items} = storeToRefs(itemStore)

let itemSelect = ref(null);
let products = ref(items.value);
let purchase = ref({
  details: []
})

onMounted(async () => {
  await itemStore.getItems(token.value, null,!itemStore.fetched)
})


const addDetail = () => {
  purchase.value.details.push({
    item_id: null,
    color_id: null,
    size_id: null,
    purchase_price: null,
    sell_price: null,
    percent_discount: 0,
    units: 1,
  });
}

const removeDetail = () => {
  purchase.value.details.pop();
}


const register = async () => {
  const response = await purchaseStore.postPurchase(token.value, purchase.value)
  if(await response){
    await $router.push({ path: '/purchases' })
  }
}

const productFilter  = (val, update) => {
  if (val === '') {
    update(() => {
      products.value = items.value

      // here you have access to "ref" which
      // is the Vue reference of the QSelect
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    products.value = items.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1 || v.description.toLowerCase().indexOf(needle) > -1)
  })
}
</script>
<style scoped>
.full-height {
  height: 100vh; /* Altura total de la pantalla */
  display: flex;
  flex-direction: column;
}

.flex-grow {
  flex-grow: 1; /* Expande el elemento para ocupar el espacio disponible */
  overflow-y: auto; /* Añade un scrollbar si el contenido es muy grande */
}

/*Input*/
:deep(.input .q-field__control),
:deep(.input .q-field__marginal),
:deep(.q-input .q-field__control),
:deep(.q-input .q-field__marginal) {
  height: 32px;
  font-size: 11px;
}

/*Select*/
:deep(.q-field--auto-height .q-field__control, ) {
  min-height: 32px !important;
  height: 32px !important;
  font-size: 12px;
}

:deep(.q-field__label) {
  font-size: 12px;
  margin-top: -2px;
}

:deep(.q-field--auto-height .q-field__native, .q-field--auto-height
.q-field__prefix,.q-field--auto-height .q-field__suffix ) {
  height: 32px !important;
  min-height: 32px !important;
}

:deep(.q-field__marginal) {
  height: 32px !important;
}

:deep(.q-field--standard .q-field__control:before) {
  border: 0px !important;
  outline: none !important;
  padding: 2px !important;
}

:deep(.q-field--auto-height .q-field__control-container) {
  padding-bottom: 2px !important;
  outline: none !important;
}
</style>
