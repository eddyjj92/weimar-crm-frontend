import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useAuthStore = defineStore('auth', () => {
  let user = ref(null);
  let token = ref(null);

  (function construct(){
    user.value = JSON.parse(localStorage.getItem('user') ?? 'null');
    token.value = localStorage.getItem('token');
  })();

  const authUser = async (user) => {
    await Loading.show();
    return await api.post("/api/login", user)
      .then(res => {
        user.value = res.data.user;
        token.value = res.data.token;
        localStorage.setItem("user", JSON.stringify(user.value))
        localStorage.setItem("token", token.value)
        Notify.create({
          type: 'positive',
          message: res.data.message,
          progress: true,
          actions: [{ icon: 'close', color: 'white' }]
        })
        return true
      })
      .catch(error => {
        if (error.response?.data.validations){
          for(let msg of Object.values(error.response.data.validations)){
            Notify.create({
              type: 'negative',
              message: msg,
              position: 'top',
              progress: true,
              actions: [{ icon: 'close', color: 'white' }]
            })
          }
        }else if (error.response?.data.message){
          Notify.create({
            type: 'negative',
            message: error.response?.data.message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', color: 'white' }]
          })
        }else {
          Notify.create({
            type: 'negative',
            message: error.message,
            position: 'top',
            progress: true,
            actions: [{ icon: 'close', color: 'white' }]
          })
        }
        return false
      })
      .finally(() => Loading.hide())
  }

  const setActiveStore = async (store) => {
    await Loading.show();
    return await api.put(`/api/auth/active_store/${store}`, {},{
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
      .then(res => {
        user.value = res.data.user
        localStorage.setItem("user", JSON.stringify(user.value))
        return true;
      })
      .catch(error => {
        return false
      })
      .finally(() => Loading.hide())
  }

  const reset = () => {
    user.value = null;
    token.value = null;
  }

  return {
    user,
    token,
    authUser,
    reset,
    setActiveStore
  }

});
