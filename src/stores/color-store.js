import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useColorStore = defineStore('color', () => {
  let colors = ref([]);
  let fetched = ref(false);
  (function construct(){
    colors.value = JSON.parse(localStorage.getItem('colors') ?? '[]');
  })();

  const getColors = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/colors'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        fetched.value = true;
        colors.value = res.data.colors;
        localStorage.setItem("colors", JSON.stringify(colors.value))
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

  const postColor = async (token, color) => {
    await Loading.show();
    return await api.post(`/api/colors`, color,{
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

  const putColor = async (token, id, color) => {
    await Loading.show();
    return await api.put(`/api/colors/${id}`, color,{
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

  const deleteColor = async (token, id) => {
    await Loading.show();
    return await api.delete(`/api/colors/${id}`,{
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
    colors,
    fetched,
    getColors,
    postColor,
    putColor,
    deleteColor
  }
});
