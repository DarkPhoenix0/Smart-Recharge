<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Reporting des collectes</h2>
    <div class="text-right font-bold text-2xl">   
      Total transaction <u>{{ solde.solde }} </u> | Montant total <u>{{ solde.gain }} (FCFA)</u>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div
      class="
        col-span-12
        flex flex-wrap
        sm:flex-nowrap
        items-center
        mt-2
      "
    >
      <button @click="getAllChargementCollect" class="btn btn-light shadow-md mr-2">
        <i class="fas fa-refresh mr-2"></i>&nbsp;Rafraichir
      </button> 
        <div class="col-span-3">
          <label for="pos-form-1" class="text-xs mr-2"> <b>Période</b></label>
        </div>
        <div class="flex mr-2"> <litepie-datepicker separator=" - " @keyup="updateDueDate(id)" ref="myRef" :start-from="startFrom" :auto-apply="false" :formatter="formatter" v-model="dateValue"></litepie-datepicker> </div>
          <div class="col-span-2">
            <label for="pos-form-1" class="text-xs mr-2"> <b>Etat</b></label>
          </div>
        <TomSelect
          v-model="selectedEtat"
          :options="{
            placeholder: 'Selectionner l\'état',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Etat',
              },
            },
          }"
          class="w-1/6"
        >
          <option
            v-for="(etat, etatKey) in listEtat"
            :value="etat.prenom"
          >
            {{ etat.libelle }}
          </option>
        </TomSelect>
        <button @click="getCollect" class="btn btn-primary shadow-md ml-2">
        <i class="fas fa-search"></i>&nbsp;Rechercher
      </button>
      <div class="hidden md:block mx-auto text-slate-500">
      </div>
      <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
        <div class="w-65 relative text-slate-500">
        <button @click="exportExcel" class="btn btn-dark shadow-md mr-2">
          <i class="fas fa-file-excel"></i>&nbsp;Exporter
        </button>
          <input
            type="text"
            v-model="search"
            class="form-control w-56 box pr-10"
            placeholder="Recherche 🔍 ..."
          />
        </div>
      </div>
    </div>
    <!-- BEGIN: Data List -->
    <div class="col-span-12 overflow-auto lg:overflow-visible">
      <table class="table table-bordered border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>DATE</th>
            <th>RÉFÉRENCE</th>
            <th>NUMÉRO INITIATEUR</th>
            <th>MONTANT (FCFA)</th>
            <th>OPÉRATEUR</th>
            <th>ETAT</th>
            <th>DATE CHARGT.</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listReportingCollect.length" >
             <td colspan="7">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(collect, collectKey) in listReportingCollect"
            :key="collectKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="collect">{{ collect.telephone }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="collect">{{ collect.telephone }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="collect">{{ collect.telephone }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="collect">{{ collect.solde }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="collect">{{ collect.solde_data }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="collect">{{ collect.operateur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="collect">{{ collect.gain }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- END: Data List -->
    <!-- BEGIN: Pagination -->
    <div class="col-span-12 text-right">
      <Pagination
        :total-pages="totalPages"
        :per-page="recordsPerPage"
        :current-page="page"
        @pagechanged="onPageChange"
      />
    </div>
    <!-- END: Pagination -->
  </div>
</template>

<script>
import { ref } from "vue";
import Loading from "vue-loading-overlay";
import axios from "axios";
import Pagination from "@/components/pagination/Main.vue";
import Config from "../../config.json";
import "vue-loading-overlay/dist/vue-loading.css";
import { saveExcel } from "@progress/kendo-vue-excel-export";
import LitepieDatepicker from 'litepie-datepicker';


export default {
  components: {
    Loading,
    Pagination,
    LitepieDatepicker
  },

  data: function () {

    return {
      myRef :"",
      dateValue: "",
      startFrom: new Date(2020, 0, 1),
      formatter : {
        date: 'DD MMM YYYY',
        month: 'MMM'
      },
      newOrderModal : ref(false),
      addItemModal : ref(false),
      selectedEtat: "",
      listFlotte: [],
      listEtat: [
        { id: "1", libelle: "En attente", ischecked: false },
        { id: "2", libelle: "Utilisé", ischecked: false },
        { id: "2", libelle: "Tout", ischecked: false },
      ],
      solde: {'solde': '', 'gain': '', 'last_transaction':''},
      listReportingCollect: [],
      page: 1,
      isLoading: false,
      fullPage: true,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
      enterpageno: "",
      search: "",
        
    };

  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllReportingCollect();
  },


  created() {
    document.title =
      "Reporting collect | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {

    recherche() {
      axios
        .get(
          `${Config.BASE_URL}collect/getAllCollectByEtat`
        )
        .then((response) => {
          this.listChargementCollect = [...response.data];
          console.log(this.listChargementCollect);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getCollect() {
      this.isLoading = true;
      const data = {
            date_debut: this.recipientType,
            date_fin: this.recipientType,
            etat: this.recipientType,
            user_id: this.recipientType,
       };
      axios
        .post(`${Config.BASE_URL}collect/getAllCollectByEtat`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "success",
            });
          }
        })
        .catch((error) => {
          this.isLoading = false;
          this.$toast.open({
            position: "top-right",
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllReportingCollect() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllChargementCollect/${this.user.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listChargementCollect = [...response.data.data];
          this.totalPages = response.data.last_page;
          this.totalRecords = response.data.total;
        })
        .catch((error) => {
          console.log("error");
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    onPageChange(page) {
      this.page = page;
      this.getAllReportingCollect();
    },

    exportExcel() {
      saveExcel({
        data: this.listChargementCollect,
        fileName: "Mes_Chargement_CompteMoney",
        columns: [
          { field: "telephone", title: "Date" },
          { field: "solde", title: "Reférence Paiement" },
          { field: "solde_data", title: "Montant" },
          { field: "operateur", title: "Mode paiement" },
          { field: "gain", title: "Etat" },
        ],
      });
    },
  },
};
</script>

<style scoped>
thead {
  background: #192a56;
  color: #fff;
}

legend {
  background-color: #192a56;
  color: #fff;
  border-radius: 10px;
  font-size: 17px;
  padding: 3px 6px;
}

fieldset {
  border: 1px solid #192a56;
  border-radius: 10px;
  padding: 10px;
}

label {
  font-size: 20px !important;
}

td {
  font-size: 16px !important;
}

input {
  font-size: 18px !important;
}

button {
  font-size: 18px !important;
}
</style>
