<template>
  <q-page class="q-pa-sm">
    <q-card>
      <q-card-section class="full-width q-pb-xs">
        <span class="text-h6">Registrar Compra</span>
      </q-card-section>
      <q-card-section class="q-pt-xs">
        <q-item class="q-py-xs">
          <q-item-section>
            <q-input v-model="purchase.purchase_date" label="Fecha de Compra" type="date" dense/>
          </q-item-section>
          <q-item-section>
            <q-select
              v-model="purchase.payment_method"
              :options="payment_methods"
              label="Método de Pago"
              dense
            />
          </q-item-section>
          <q-item-section>
            <q-input v-model="purchase.term" label="Término" dense/>
          </q-item-section>
        </q-item>
        <q-item class="q-py-xs">
          <q-item-section>
            <q-input v-model="purchase.invoice" label="Factura" dense/>
          </q-item-section>
          <q-item-section>
            <q-input v-model="purchase.invoice_date" label="Fecha de Factura" type="date" dense/>
          </q-item-section>
          <q-item-section>
            <q-input v-model="purchase.discount" label="Descuento" type="number" dense/>
          </q-item-section>
        </q-item>
        <q-item class="q-py-xs">
          <q-item-section>
            <q-input v-model="purchase.balance" label="Saldo" type="number" dense />
          </q-item-section>
          <q-item-section>
            <q-select
              v-model="purchase.entity_id"
              :options="suppliers"
              option-label="name"
              option-value="id"
              emit-value
              map-options
              label="Entidad"
              dense
            />
          </q-item-section>
          <q-item-section>
            <q-select
              v-model="purchase.iva_id"
              :options="ivas"
              option-label="description"
              option-value="id"
              emit-value
              map-options
              label="IVA"
              dense
            />
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
    <q-card class="q-mt-sm q-pt-md">
      <q-card-section class="full-width">
        <span v-if="purchase.details.length === 0" class="absolute-center text-h6 text-grey-6">Sin Detalles</span>
        <span v-else class="absolute-center text-h6 text-grey-6">Detalles de la Compra</span>
      </q-card-section>
      <q-card-section v-if="purchase.details.length > 0">
        <q-item v-for="(dt, i) in purchase.details" :key="i">
          <q-item-section style="min-width: 180px">
            <q-select
              outlined dense @update:model-value="dt.color_id = null; dt.size_id = null;"
              :options="items" v-model="dt.item_id"
              option-label="name" option-value="id"
              emit-value map-options label="Artículo"
            ></q-select>
          </q-item-section>
          <q-item-section>
            <q-select
              outlined dense :disable="!dt.item_id"
              :options="items.find(i => i.id === dt.item_id)?.colors" v-model="dt.color_id"
              option-label="name" option-value="id"
              emit-value map-options label="Color"
            ></q-select>
          </q-item-section>
          <q-item-section>
            <q-select
              outlined dense :disable="!dt.item_id"
              :options="items.find(i => i.id === dt.item_id)?.sizes" v-model="dt.size_id"
              option-label="name" option-value="id"
              emit-value map-options label="Talla"
            ></q-select>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="Precio Compra"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="Precio Venta"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense label="% Descuento"></q-input>
          </q-item-section>
          <q-item-section>
            <q-input type="number" min="0" outlined dense label="Unidades"></q-input>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="full-width">
        <q-item>
          <q-item-section >
            <q-btn @click="addDetail" class="full-width bg-positive" icon="add">Nuevo Detalle</q-btn>
          </q-item-section>
          <q-item-section v-if="purchase.details.length > 0">
            <q-btn class="full-width bg-negative" icon="remove">Eliminar Detalle</q-btn>
          </q-item-section>
          <q-item-section v-if="purchase.details.length > 0">
            <q-btn class="full-width bg-primary" icon="save">Confirmar Compra</q-btn>
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

const $q = useQuasar();
const authStore = useAuthStore();
const {token, user} = storeToRefs(authStore);
const purchaseStore = usePurchaseStore();
const {purchases, suppliers, payment_methods, purchase_states} = storeToRefs(purchaseStore);
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

  });
}
</script>
