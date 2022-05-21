<template>
  <div>
    <DarkModeSwitcher />
    <loading v-model:active="isLoading"
             :can-cancel="true"
             :is-full-page="fullPage"/>
    <div class="container sm:px-10">
      <div class="block xl:grid grid-cols-2 gap-4">
        <!-- BEGIN: Login Info -->
        <div class="hidden xl:flex flex-col min-h-screen">
          <div class="my-auto">
            <img
              alt="Illustration Login Smart Recharge"
              class="-w-1/2 -mt-16"
              src="@/assets/images/illustration.svg"
            />
            <div
              class="-text-white font-medium text-4xl leading-tight mt-10"
            >
              <em>"Gagner en temps"</em> avec
              <br />
              <b>Smart-R</b>
            </div>
            <div
              class="-mt-5 text-lg text-white text-opacity-70 dark:text-slate-400"
            >
              Rechargez n'importe où et n'importe quand en quelques clics.
            </div>
          </div>
        </div>
        <!-- END: Login Info -->
        <!-- BEGIN: Login Form -->
        <div class="h-screen xl:h-auto flex py-5 xl:py-0 my-10 xl:my-0">
          <div
            class="my-auto mx-auto xl:ml-20 bg-white dark:bg-darkmode-600 xl:bg-transparent px-5 sm:px-8 py-8 xl:p-0 rounded-md shadow-md xl:shadow-none w-full sm:w-3/4 lg:w-2/4 xl:w-auto"
          >
            <img
                alt="Illustration Logo Smart Recharge"
                class="-"
                width="150"
                src="@/assets/images/logos/logo.png"
            />
            <br>
            <h2
              class="font-bold text-2xl xl:text-3xl text-center xl:text-left"
            >
              Réinitialiser mot de passe
            </h2>
            <p>Entrez votre adresse email pour réinitialiser votre mot de passe</p>
            <!-- <div class="mt-2 text-slate-400 xl:hidden text-center">
              <em>"Gagner en temps"</em> avec <b>Smart Recharge</b>. Rechargez n'importe où et n'importe quand en quelques clics.
            </div> -->
            <div class="mt-8">
              <label for="email"><b>Adresse email <span class="text-danger">*</span></b></label>
              <input
                type="text"
                v-model="email"
                class="login__input form-control py-3 px-4 block"
                placeholder="Ex: abc@email.com"
              />
            </div>
            <div class="mt-5 xl:mt-8 text-center xl:text-left">
              <button
                  @click.prevent="resetPassword"
                  :disabled = "!email"
                  type="submit"
                  class="btn btn-primary py-3 px-4 w-full xl:w-32 xl:mr-3 align-top"
              >
                Réinitialiser
              </button>
            </div>
             <br>
            <span>
            <router-link to="login">Je souhaites me connecter</router-link>  
            </span>
          </div>
        </div>
        <!-- END: Login Form -->
      </div>
    </div>
  </div>
</template>


<script>
  import { onMounted } from "vue";
  import DarkModeSwitcher from "@/components/dark-mode-switcher/Main.vue";
  import dom from "@left4code/tw-starter/dist/js/dom";
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';
  import axios from 'axios';
  import Config from "../../config.json";

  export default {
    components: {
      Loading
    },
    data: function() {
      return {
        email : '',
        isLoading: false,
        fullPage: true
      }
    },
    mounted() {
      dom("body").removeClass("main").removeClass("error-page").addClass("login");
      localStorage.removeItem('user');
    },
    created() {
      document.title = 'Mot de passe oublié | Cateli Smart Recharge - Plateforme en ligne de rechargement et d\'achat de credits';
    },
    methods : {
      resetPassword: function () {
        this.isLoading = true;
        const data = {
          'email' : this.email,
        }
        axios.put(`${Config.BASE_URL}login/reinitialisePassWord`, data)
            .then( response =>  {
              console.log(response);
              if (response.data.error) {
                this.isLoading = false;
                this.$toast.open({
                  message: `${response.data.message}`,
                  type: 'error',
                });
              } 
              else {
                this.isLoading = false;
                this.$toast.open({
                  // position: 'top-right',
                  message: `Mot de réinitialisé avec succès`,
                  type: 'success',
                });
                this.$router.push({ name: 'Login' });
              }
            })
      }
    }
  };

</script>

<style>
  input, label, button, a {
    font-size: 16px !important;
  }
</style>