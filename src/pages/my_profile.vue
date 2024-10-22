<template>
  <q-page>
    <div class="row q-col-gutter-sm q-ma-xs">
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card class="my-card" flat bordered>
          <q-card-section horizontal>
            <q-card-section class="q-pt-xs">
              <div class="text-overline">Perfil de Usuario</div>
              <div class="text-h5 q-mt-sm q-mb-xs">{{profile.name}}</div>
              <div class="text-caption text-grey">
                (Skills profesionales)
                Sales and Marketing Executive | Graduate and past committee | Keynote speaker on Selling and Recruiting
                Topics
              </div>
            </q-card-section>

            <q-card-section class="col-5 flex flex-center">
              <q-img
                class="rounded-borders"
                :src="`${server}/storage/${user?.avatar}`"
              />
            </q-card-section>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            (Descripción)
            Assessing clients needs and present suitable promoted products. Liaising with and persuading targeted
            doctors to prescribe our products utilizing effective sales skills.
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card>
          <q-card-section>
            <q-form
              class="q-gutter-md"
            >
              <q-input
                filled
                v-model="profile.name"
                label="Nombre"
              />

              <q-input
                filled
                v-model="profile.email"
                label="Correo"

              />

              <q-input
                filled
                v-model="profile.role"
                label="Rol de Usuario"
                readonly
              />

              <div>
                <q-btn label="Update" type="submit" color="primary"/>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref} from 'vue'
import {useAuthStore} from "stores/auth-store";
import {storeToRefs} from "pinia";
import {server} from "boot/axios";

const authStore = useAuthStore()
const {user} = storeToRefs(authStore)

const profile = ref({
  name: user.value?.name,
  email: user.value?.email,
  role: user.value?.roles[0]?.name
});
</script>

<style scoped>

</style>
