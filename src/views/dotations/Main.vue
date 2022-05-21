<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Historique des dotations</h2>
    <div class="text-right font-bold text-2xl">
      Solde airtime <u>{{ solde.airtime }} FCFA</u> | Solde DATA
      <u>{{ solde.data }} MB</u>
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
      <!-- <button @click="exportExcel" class="btn btn-dark shadow-md mr-2">
        <i class="fas fa-file-excel"></i>&nbsp;Exporter
      </button> -->
      <button @click="getAllDotations" class="btn btn-light shadow-md mr-2">
        <i class="fas fa-refresh"></i>&nbsp;Rafraichir
      </button>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--Showing 1 to 10 of 150 entries-->
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
      <table class="table border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>SERVICE</th>
            <th>VALEUR</th>
            <th>DATE CREATION</th>
            <th>DATE EFFET</th>
            <th>DERNIÈRE UTILISATION</th>
            <th>ETAT</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(dotation, dotationKey) in filteredListDotations"
            :key="dotationKey"
          >
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(dotation.service)"></td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(dotation.valeur)"></td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(dotation.create_time)"></td>
            <td class="w-40 border border-slate-300" 
            v-html="highlightMatches(dotation.date_effet)"></td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(dotation.derniere_utilisation)"></td>
            <td class="w-20 border border-slate-300">
              <div
                v-if="dotation"
                class="flex items-center justify-center"
                :style="{'width': '60px'}"
                :class="{
                  'bg-red-500 rounded text-white':
                    !dotation.etat,
                  'bg-green-500 rounded text-white': dotation.etat,
                }"
              >
                <span v-if="dotation.etat">Actif</span>
                <span v-if="!dotation.etat">Inactif</span>
              </div>
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

export default {
  components: {
    Loading,
    Pagination,
  },
  data: function () {
    return {
      listDotations: [],
      solde: {'airtime': '', 'data': ''},
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
  computed: {
    filteredListDotations() {
      return this.listDotations.filter(row => {
        const service = row.service.toLowerCase();
        const valeur = row.valeur.toLowerCase();
        const date_creation = row.create_time.toLowerCase();
        const date_effet = row.date_effet.toLowerCase();
        const derniere_utilisation = row.derniere_utilisation.toLowerCase();
        const etat = row.etat.toString().toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return service.includes(searchTerm) ||
            valeur.includes(searchTerm) ||
            date_creation.includes(searchTerm) ||
            date_effet.includes(searchTerm) ||
            derniere_utilisation.includes(searchTerm) ||
            etat.includes(searchTerm);
      });
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllDotations();
  },
  created() {
    document.title =
      "Dotations | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    highlightMatches(text) {
      const matchExists = text.toLowerCase().includes(this.search.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, 'ig');
      return text.replace(re, matchedText => `<span style="background-color:#f1c40f;" >${matchedText}</span>`);
    },
    getAllDotations() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllDotationByClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listDotations = [...response.data.data];
          this.solde.airtime = response.data.solde_airtime;
          this.solde.data = response.data.volume_data;
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
      this.getAllDotations();
    },

    exportExcel() {
      saveExcel({
        data: this.listDotations,
        fileName: "Mes_Dotations",
        columns: [
          { field: "service", title: "Service" },
          { field: "valeur", title: "Valeur" },
          { field: "date_creation", title: "Date creation" },
          { field: "date_effet", title: "Date effet" },
          { field: "derniere_utilisation", title: "Dernière utilisation" },
          { field: "etat", title: "Etat" },
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
