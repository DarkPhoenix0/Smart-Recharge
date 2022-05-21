<template>
  <loading v-model:active="isLoading"
           :can-cancel="true"
           :is-full-page="fullPage"/>
  <div class="grid grid-cols-12">
    <div class="col-span-12 2xl:col-span-12">
      <div class="grid grid-cols-12 gap-6">
        <!-- BEGIN: Report Wallet & Data -->
        <div class="col-span-12 mt-8">
          <div class="flex items-center h-10">
            <h2 class="text-2xl font-medium truncate mr-5">Vue génerale - Statistiques</h2>
            <a @click="getClientDashboard" class="ml-auto flex items-center text-primary cursor-pointer">
              <RefreshCcwIcon class="w-4 h-4 mr-3 " />
              <span class="text-2xl ">Rafraichir les données</span>
            </a>
          </div>
          <div class="grid grid-cols-12 gap-6 mt-5 ">
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5 bg__moov">
                  <div class="flex">
                    <h3>
                      <b>MOOV</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/wallet_icon.png"
                           alt="Illustration Wallet">
                          <span
                              :style="{'position' : 'absolute', 'top' : '55%','right': '0.5%' }"
                              class="inline-flex items-center justify-center px-2 py-1 mr-2 text-sm font-bold leading-none bg-white text-black rounded-full">
                            {{ stateMoovWalletExist }}
                          </span>
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    <span v-if="isMoovWalletExist">
                      {{ thousandSeparator(statisticsPortefeuille.soldemoov) }}
                    </span>
                    <span v-if="!isMoovWalletExist">
                      N/A
                    </span>
                  </div>
                  <div class="text-base text-white mt-1">
                    <img
                        :style="{'position' : 'absolute'}"
                        width="22"
                        src="@/assets/images/dashboard/data_icon_white.png"
                        alt="Illustration Data Wallet">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {{ statisticsPortefeuille.volumemoov }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5 bg__mtn">
                  <div class="flex">
                    <h3>
                      <b>MTN</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/wallet_icon.png"
                          alt="Illustration Wallet">
                      <span
                          :style="{'position' : 'absolute', 'top' : '55%','right': '1.5%' }"
                          class="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none bg-white text-black rounded-full">
                            {{ stateMtnWalletExist }}
                          </span>
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    <span v-if="isMtnWalletExist">
                      {{ thousandSeparator(statisticsPortefeuille.soldemtn) }}
                    </span>
                    <span v-if="!isMtnWalletExist">
                      N/A
                    </span>
                  </div>
                  <div class="text-base text-dark mt-1">
                    <img
                        :style="{'position' : 'absolute'}"
                        width="22"
                        src="@/assets/images/dashboard/data_icon_black.png"
                        alt="Illustration Data Wallet">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {{ statisticsPortefeuille.volumemtn }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5 bg__orange">
                  <div class="flex">
                    <h3>
                      <b>ORANGE</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/wallet_icon.png"
                          alt="Illustration Wallet">
                      <span
                          :style="{'position' : 'absolute', 'top' : '55%','right': '1.5%' }"
                          class="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none bg-white text-black rounded-full">
                            {{ stateOrangeWalletExist }}
                          </span>
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    <span v-if="isOrangeWalletExist">
                      {{ thousandSeparator(statisticsPortefeuille.soldeorange) }}
                    </span>
                    <span v-if="!isOrangeWalletExist">
                      N/A
                    </span>
                  </div>
                  <div class="text-base text-white mt-1">
                    <img
                        :style="{'position' : 'absolute'}"
                        width="22"
                        src="@/assets/images/dashboard/data_icon_white.png"
                        alt="Illustration Data Wallet">
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {{ statisticsPortefeuille.volumeorange }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END: General Report Wallet & Data -->
        <!-- BEGIN: Report Airtime -->
        <div class="col-span-12 mt-8">
          <div class="flex items-center h-10">
            <h2 class="text-2xl font-medium truncate mr-5">Airtime</h2>
          </div>
          <div class="grid grid-cols-12 gap-6 mt-5 ">
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h3>
                      <b>JOUR</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/airtime_icon.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    {{ nbreStatisticsChargementJour }}
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsChargementJour }} FCFA
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h3>
                      <b>SEMAINE</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/airtime_icon.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    {{ nbreStatisticsChargementSemaine }}
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsChargementSemaine }} FCFA
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h3>
                      <b>MOIS</b>
                    </h3>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/airtime_icon.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    {{ nbreStatisticsChargementMois }}
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsChargementMois }} FCFA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END: General Report Airtime -->
        <!-- BEGIN: Report Money -->
        <div class="col-span-12 mt-8">
          <div class="flex items-center h-10">
            <h2 class="text-2xl font-medium truncate mr-5">
              Money
              <span class="inline-flex items-center justify-center
              px-2 py-1 mr-2 text-2xl font-bold leading-none text-white
              bg-dark rounded-full">
                <span v-if="statisticsMoney.solde">
                  {{ thousandSeparator(statisticsMoney.solde) }}
                </span>
                <span v-if="!statisticsMoney.solde">
                  0 FCFA
                </span>
              </span>
            </h2>
          </div>
          <div class="grid grid-cols-12 gap-6 mt-5 ">
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h1 :style="{'font-size': '18px'}">
                      <b>Jour</b>
                    </h1>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/money.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    <span class="txt__moov">
                      {{ nbreStatisticsMoneyJour }}
                    </span>
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsMoneyJour}} FCFA
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h1 :style="{'font-size': '18px'}">
                      <b>Semaine</b>
                    </h1>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/money.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                    <span class="txt__mtn">
                      {{ nbreStatisticsMoneySemaine }}
                    </span>
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsMoneySemaine }} FCFA
                  </div>
                </div>
              </div>
            </div>
            <div class="col-span-12 sm:col-span-6 xl:col-span-4 intro-y">
              <div class="report-box zoom-in">
                <div class="box p-5">
                  <div class="flex">
                    <h1 :style="{'font-size': '18px'}">
                      <b>Mois</b>
                    </h1>
                    <div class="ml-auto">
                      <img
                          :style="{'position': 'absolute', 'right': '2%'}"
                          width="54"
                          src="@/assets/images/dashboard/money.png"
                          alt="Illustration Wallet">
                    </div>
                  </div>
                  <div
                      class="text-3xl font-medium leading-8 mt-6">
                      <span class="txt__orange">
                        {{ nbreStatisticsMoneyMois }}
                      </span>
                  </div>
                  <div class="text-base text-slate-500 mt-1" :style="{'font-size': '18px'}">
                    {{ caStatisticsMoneyMois }} FCFA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- END: Report Money -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, provide } from "vue";
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
      user : null,
      statisticsBeneficiaire: '',
      statisticsChargement: '',
      statisticsPortefeuille: '',
      statisticsMoney: '',
      isLoading: false,
      fullPage: true,
      isMoovWalletExist: false,
      isMtnWalletExist: false,
      isOrangeWalletExist: false,
      stateMoovWalletExist: '',
      stateMtnWalletExist: '',
      stateOrangeWalletExist: '',
      nbreStatisticsChargementJour: '',
      caStatisticsChargementJour: '',
      nbreStatisticsChargementSemaine: '',
      caStatisticsChargementSemaine: '',
      nbreStatisticsChargementMois: '',
      caStatisticsChargementMois: '',
      nbreStatisticsMoneyJour: '',
      caStatisticsMoneyJour: '',
      nbreStatisticsCMoneySemaine: '',
      caStatisticsMoneySemaine: '',
      nbreStatisticsMoneyMois: '',
      caStatisticsMoneyMois: '',
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getClientDashboard();
  },
  created() {
    document.title = 'Tableau de bord | Cateli Smart Recharge - Plateforme en ligne de rechargement et d\'achat de credits';
  },
  methods : {
    getClientDashboard() {
      this.isLoading = true;
      axios.get(`${Config.BASE_URL}services/getclientDashboard/${this.user.id}`)
          .then(response => {
            this.isLoading = false;
            this.statisticsBeneficiaire = response.data.beneficiaire;
            this.statisticsChargement = response.data.chargement;
            this.statisticsPortefeuille = response.data.portefeuille;
            this.statisticsMoney = response.data.money;
            this.isMoovWalletExist = this.statisticsPortefeuille.exist.moov;
            this.isMtnWalletExist = this.statisticsPortefeuille.exist.mtn;
            this.isOrangeWalletExist = this.statisticsPortefeuille.exist.orange;
            this.stateMoovWalletExist = this.statisticsPortefeuille.etat.moov;
            this.stateMtnWalletExist = this.statisticsPortefeuille.etat.mtn;
            this.stateOrangeWalletExist = this.statisticsPortefeuille.etat.orange;
            // Airtime
            this.nbreStatisticsChargementJour = this.statisticsChargement.jour.nbre;
            this.caStatisticsChargementJour = this.statisticsChargement.jour.ca;
            this.nbreStatisticsChargementSemaine = this.statisticsChargement.semaine.nbre;
            this.caStatisticsChargementSemaine = this.statisticsChargement.semaine.ca;
            this.nbreStatisticsChargementMois = this.statisticsChargement.mois.nbre;
            this.caStatisticsChargementMois = this.statisticsChargement.mois.ca;
            // Money
            this.nbreStatisticsMoneyJour = this.statisticsMoney.jour.nbre;
            this.caStatisticsMoneyJour = this.statisticsMoney.jour.ca;
            this.nbreStatisticsMoneySemaine = this.statisticsMoney.semaine.nbre;
            this.caStatisticsMoneySemaine = this.statisticsMoney.semaine.ca;
            this.nbreStatisticsMoneyMois = this.statisticsMoney.mois.nbre;
            this.caStatisticsMoneyMois = this.statisticsMoney.mois.ca;
          }).catch(error => {
            this.isLoading = false;
            this.$toast.open({
              message: `${JSON.stringify(error)}`,
              type: 'error',
            });
          });
    },
    thousandSeparator(value) {
      const spaces = value => String(value)
          .replace(
              /(?!^)(?=(?:\d{3})+$)/g,
              ' '
          );
      return spaces(value)
    }
  }
};

</script>

<style scoped>
.bg__moov {
  background-color: #0063AD !important;
  color: #fff !important;
}

.txt__moov {
  color: #0063AD !important;
  font-weight: 800;
}

.bg__mtn {
  background-color: #FFCC06 !important;
  color: #000 !important;
}

.txt__mtn {
  color: #FFCC06 !important;
  font-weight: 800;
}

.bg__orange {
  background-color: #FF6600 !important;
  color: #fff !important;
}

.txt__orange {
  color: #FF6600 !important;
  font-weight: 800;
}
</style>