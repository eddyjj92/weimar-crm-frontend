import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useItemStore = defineStore('item', () => {
  let items = ref([]);
  (function construct(){
    items.value = JSON.parse(localStorage.getItem('items') ?? '[]');
  })();

  const getItems = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/items'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        items.value = res.data.items;
        localStorage.setItem("items", JSON.stringify(items.value))
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
          position: 'top',
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return false
      })
      .finally(() => hideLoading ? Loading.hide() : null)
  }

  const postItem = async (token, item) => {
    const formData = new FormData();
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        if (key === 'colors'){
          item[key].forEach(color => {
            formData.append('colors[]', color);
          })
        }else if (key === 'sizes'){
          item[key].forEach(size => {
            formData.append('sizes[]', size);
          })
        }else{
          formData.append(key, item[key]);
        }
      }
    }
    await Loading.show();
    return await api.post(`/api/items`, formData,{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
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

  const putItem = async (token, id, item) => {
    const formData = new FormData();
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        if (key === 'colors'){
          item[key].forEach(color => {
            formData.append('colors[]', color);
          })
        }else if (key === 'sizes'){
          item[key].forEach(size => {
            formData.append('sizes[]', size);
          })
        }else{
          formData.append(key, item[key]);
        }
      }
    }
    formData.append('_method', 'PUT');
    await Loading.show();
    return await api.post(`/api/items/${id}`, formData,{
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
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

  const deleteItem = async (token, id) => {
    await Loading.show();
    return await api.delete(`/api/items/${id}`,{
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


  const setActiveItem = async (token, id) => {
    await Loading.show();
    return await api.put(`/api/items/active/${id}`,{},{
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
    items,
    getItems,
    postItem,
    putItem,
    deleteItem,
    setActiveItem
  }
});
