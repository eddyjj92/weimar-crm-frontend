import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useEntityStore = defineStore('entity', () => {
  let entities = ref([]);
  let types = ref([]);
  let id_types = ref([]);
  let fetched = ref(false);

  (function construct(){
    entities.value = JSON.parse(localStorage.getItem('entities') ?? '[]');
    types.value = JSON.parse(localStorage.getItem('entity_types') ?? '[]');
    id_types.value = JSON.parse(localStorage.getItem('id_types') ?? '[]');
  })();

  const getEntities = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/entities'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        fetched.value = true;
        entities.value = res.data.entities;
        types.value = res.data.types;
        id_types.value = res.data.id_types;
        localStorage.setItem("entities", JSON.stringify(entities.value))
        localStorage.setItem("entity_types", JSON.stringify(types.value))
        localStorage.setItem("id_types", JSON.stringify(id_types.value))
        return true
      })
      .catch(error => {
        let message;
        if (error.response?.data.message){
          message = error.response?.data.message
        }else {
          message = error.message
        }
        Notify.create({
          type: 'negative',
          message: message,
          position: 'top'
        })
        return false
      })
      .finally(() => hideLoading ? Loading.hide() : null)
  }

  const postEntity = async (token, entity) => {
    await Loading.show();
    return await api.post(`/api/entities`, entity,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        Notify.create({
          type: 'positive',
          message: res.data.message,
          position: 'top-right'
        })
        return true
      })
      .catch(error => {
        let message;
        if (error.response?.data.validations){
          for(let msg of Object.values(error.response.data.validations)){
            Notify.create({
              type: 'negative',
              message: msg,
              position: 'top-right'
            })
          }
          return false;
        }else if (error.response?.data.message){
          message = error.response?.data.message
        }else {
          message = error.message
        }
        Notify.create({
          type: 'negative',
          message: message,
          position: 'top-right'
        })
        return false;
      })
      .finally(() => Loading.hide())
  }

  const putEntity = async (token, id, entity) => {
    await Loading.show();
    return await api.put(`/api/entities/${id}`, entity,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        Notify.create({
          type: 'positive',
          message: res.data.message,
          position: 'top-right',
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return true
      })
      .catch(error => {
        let message;
        if (error.response?.data.validations){
          for(let msg of Object.values(error.response.data.validations)){
            Notify.create({
              type: 'negative',
              message: msg,
              position: 'top-right',
              progress: true,
              actions: [{ icon: 'close', color: 'white' }]
            })
          }
          return false;
        }else if (error.response?.data.message){
          message = error.response?.data.message
        }else {
          message = error.message
        }
        Notify.create({
          type: 'negative',
          message: message,
          position: 'top-right',
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return false;
      })
      .finally(() => Loading.hide())
  }

  const deleteEntity = async (token, id) => {
    await Loading.show();
    return await api.delete(`/api/entities/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        Notify.create({
          type: 'positive',
          message: res.data.message,
          position: 'top-right',
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return true
      })
      .catch(error => {
        let message;
        if (error.response?.data.message){
          message = error.response?.data.message
        }else {
          message = error.message
        }
        Notify.create({
          type: 'negative',
          message: message,
          position: 'top-right',
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return false;
      })
      .finally(() => Loading.hide())
  }

  return {
    entities,
    types,
    id_types,
    fetched,
    getEntities,
    postEntity,
    putEntity,
    deleteEntity
  }
});
