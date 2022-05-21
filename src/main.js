import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import globalComponents from "./global-components";
import utils from "./utils";
import "./assets/css/app.css";
import VueLoading from 'vue-loading-overlay';
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import VueTheMask from 'vue-the-mask';
import number from "@coders-tm/vue-number-format";
const app = createApp(App).use(router).use(createPinia());
import LitepieDatepicker from 'litepie-datepicker';

globalComponents(app);
utils(app);

app.use(VueLoading);
app.use(VueToast);
app.use(number, {precision: 4})
app.use(VueTheMask);
app.use(LitepieDatepicker);

app.mount("#app");
