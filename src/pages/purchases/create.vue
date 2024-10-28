<template>
  <q-page class="q-pa-sm full-height row">
    <q-card class="flex-grow col-auto q-px-none" style="max-height: 180px">
      <q-card-section class="full-width q-pb-xs">
        <span class="text-h6">Nueva Compra</span>
      </q-card-section>
      <q-card-section class="q-pt-xs q-px-none">
        <q-item class="q-py-xs">
          <q-item-section style="min-width: 25%">
            <q-select
              outlined
              v-model="purchase.entity_id"
              :options="suppliers"
              option-label="trade_name"
              option-value="id"
              emit-value
              map-options
              label="Proveedor"
              dense
              class="my-custom-select"
            />
          </q-item-section>
          <q-item-section>
            <q-input outlined v-model="purchase.invoice" label="Factura" dense/>
          </q-item-section>
          <q-item-section>
            <q-select
              outlined
              v-model="purchase.payment_shape"
              :options="payment_shapes"
              map-options
              emit-value
              label="Forma de Pago"
              dense
            />
          </q-item-section>
          <q-item-section>
            <q-input outlined v-model="purchase.term" label="Plazo" dense/>
          </q-item-section>
          <q-item-section>
            <q-input outlined v-model="purchase.invoice_date" label="Fecha de Factura" type="date" dense/>
          </q-item-section>
        </q-item>
        <q-item class="q-py-xs">
          <q-item-section style="min-width: 25%">
            <q-select
              outlined
              v-model="purchase.entity_id"
              :options="suppliers"
              option-label="trade_name"
              option-value="id"
              emit-value
              map-options
              label="Producto"
              dense
            />
          </q-item-section>
          <q-item-section>
            <q-item class="q-pa-none">
              <q-item-section style="min-width: 65%">
                <q-select
                  outlined
                  v-model="purchase.entity_id"
                  :options="suppliers"
                  option-label="trade_name"
                  option-value="id"
                  emit-value
                  map-options
                  label="Color"
                  dense
                />
              </q-item-section>
              <q-item-section>
                <q-input outlined label="% IVA" dense/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section  style="min-width: 20%">
            <q-item class="q-pa-none">
              <q-item-section>
                <q-input outlined label="Precio Compra" dense/>
              </q-item-section>
              <q-item-section>
                <q-input outlined label="Precio Venta + IVA" dense/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section style="min-width: 30%">
            <q-item class="q-pa-none">
              <q-item-section>
                <q-input outlined label="% Desc" dense/>
              </q-item-section>
              <q-item-section style="min-width: 40%">
                <q-input outlined  dense class="input-box"/>
              </q-item-section>
              <q-item-section style="min-width: 40%">
                <q-input outlined dense class="input-box"/>
              </q-item-section>
            </q-item>
          </q-item-section>
          <q-item-section>
            <q-item class="q-pa-none">
              <q-item-section>
                <q-btn color="primary" icon="pan_tool_alt" dense></q-btn>
              </q-item-section>
              <q-item-section>
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
              <th class="text-left">Dessert (100g serving)</th>
              <th class="text-right">Calories</th>
              <th class="text-right">Fat (g)</th>
              <th class="text-right">Carbs (g)</th>
              <th class="text-right">Protein (g)</th>
              <th class="text-right">Sodium (mg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-left">Frozen Yogurt</td>
              <td class="text-right">159</td>
              <td class="text-right">6</td>
              <td class="text-right">24</td>
              <td class="text-right">4</td>
              <td class="text-right">87</td>
            </tr>
            <tr>
              <td class="text-left">Frozen Yogurt</td>
              <td class="text-right">159</td>
              <td class="text-right">6</td>
              <td class="text-right">24</td>
              <td class="text-right">4</td>
              <td class="text-right">87</td>
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
            <q-input outlined dense label="Abono"></q-input>
          </q-item-section>
          <q-item-section>
            <q-btn outline icon="save" color="primary">Guardar</q-btn>
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
  height: 30px;
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
