import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useUserStore = defineStore('user', () => {
  let users = ref([]);
  (function construct(){
    users.value = JSON.parse(localStorage.getItem('users') ?? '[]');
  })();

  const getUsers = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/users'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        users.value = res.data.users;
        localStorage.setItem("users", JSON.stringify(users.value))
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

  const postUser = async (token, user) => {
    const formData = new FormData();
    for (const key in user) {
      if (user.hasOwnProperty(key)) {
        if (key === 'stores'){
          user[key].forEach(st => {
            formData.append('stores[]', st);
          })
        }else{
          formData.append(key, user[key]);
        }
      }
    }
    await Loading.show();
    return await api.post(`/api/users`, formData,{
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

  const putUser = async (token, id, user) => {
    const formData = new FormData();
    for (const key in user) {
      if (key === 'stores'){
        user[key].forEach(st => {
          formData.append('stores[]', st);
        })
      }else{
        formData.append(key, user[key]);
      }
    }
    formData.append('_method', 'PUT');
    await Loading.show();
    return await api.post(`/api/users/${id}`, formData,{
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

  const deleteUser = async (token, id) => {
    await Loading.show();
    return await api.delete(`/api/users/${id}`,{
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

  const enableDisableUser = async (token, id) => {
    await Loading.show();
    return await api.put(`/api/users/enable-disable/${id}`,{},{
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

  const changePasswordUser = async (token, id, data) => {
    await Loading.show();
    return await api.patch(`/api/users/change-password/${id}`,data,{
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

  return {
    users,
    getUsers,
    postUser,
    putUser,
    deleteUser,
    enableDisableUser,
    changePasswordUser
  }

});
