import {defineStore} from "pinia";
import {ref, watchEffect} from "vue";

const useLocaleStore = defineStore('locale', ()=>{
    const locale = ref(localStorage.getItem('locale') || 'zh');
    watchEffect(()=>{
        localStorage.setItem('locale', locale.value);
    });
    const setLocale = (l:'zh'|'ja'|'en')=>{
        locale.value = l;
    };
    const timeZone = ref(localStorage.getItem('timezone') || 'Asia/Shanghai');
    watchEffect(()=>{
        localStorage.setItem('timezone', timeZone.value);
    });
    const setTimezone = (tz:string)=>{
        timeZone.value = tz;
    }
    return {locale, setLocale, timeZone, setTimezone};
});

export default useLocaleStore;