import { defineStore } from 'pinia';
import {ref} from "vue";
import {api} from "boot/axios";
import {Loading, Notify} from "quasar";

export const useSizeStore = defineStore('size', () => {
  let sizes = ref([]);
  let fetched = ref(false);

  (function construct(){
    sizes.value = JSON.parse(localStorage.getItem('sizes') ?? '[]');
  })();

  const getSizes = async (token, filters = null, loading = true, hideLoading = true) => {
    loading ? await Loading.show() : null;
    return await api.get(`${filters ?? '/api/sizes'}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        fetched.value = true;
        sizes.value = res.data.sizes;
        localStorage.setItem("sizes", JSON.stringify(sizes.value))
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

  return {
    sizes,
    fetched,
    getSizes,
  }

});
