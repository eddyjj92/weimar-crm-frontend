import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useEntityStore = defineStore('store', () => {
  let stores = ref([]);
  let fetched = ref(false);
  (function construct(){
    stores.value = JSON.parse(localStorage.getItem('stores') ?? '[]');
  })();

  const getStores = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/stores'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        fetched.value = true;
        stores.value = res.data.stores;
        localStorage.setItem("stores", JSON.stringify(stores.value))
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

  const postStore = async (token, store) => {
    await Loading.show();
    return await api.post(`/api/stores`, store,{
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

  const putStore = async (token, id, store) => {
    await Loading.show();
    return await api.put(`/api/stores/${id}`, store,{
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

  const deleteStore = async (token, id) => {
    await Loading.show();
    return await api.delete(`/api/stores/${id}`,{
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
    stores,
    fetched,
    getStores,
    postStore,
    putStore,
    deleteStore
  }
});
