<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">
      Historique des chargements
    </h2>
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
      <button @click="getAllChargements" class="btn btn-light shadow-md mr-2">
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
      <table class="table table-bordered border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>DATE</th>
            <th>FLOTTE</th>
            <th>OPERATEUR</th>
            <th>TYPE PORTEFEUILLE</th>
            <th>VALEUR CHARGÉE</th>
            <th>SOLDE AVANT</th>
            <th>SOLDE APRÈS</th>
            <th>TYPE CHARGEMENT</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(chargement, chargementKey) in filteredListChargement"
            :key="chargementKey">
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.create_time)"></td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.portefeuille)"></td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.operateur)"></td>
            <td class="w-40 border border-slate-300" v-if="chargement.type_portefeuille" v-html="highlightMatches(chargement.type_portefeuille)"></td>
            <td class="w-40 border border-slate-300" v-if="!chargement.type_portefeuille">
              N/A
            </td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.montant)"></td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.ancien_solde)"></td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.nouveau_solde)"></td>
            <td class="w-40 border border-slate-300" v-html="highlightMatches(chargement.type)"></td>
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
      listChargements: [],
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
    filteredListChargement() {
      return this.listChargements.filter(row => {
        const create_time = row.create_time?.toLowerCase();
        const portefeuille = row.portefeuille?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const type_portefeuille = row.type_portefeuille?.toLowerCase();
        const montant = row.montant?.toLowerCase();
        const ancien_solde = row.ancien_solde?.toLowerCase();
        const nouveau_solde = row.nouveau_solde?.toLowerCase();
        const type = row.type?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return create_time.includes(searchTerm) ||
            portefeuille.includes(searchTerm) ||
            operateur.includes(searchTerm) ||
            type_portefeuille.includes(searchTerm) ||
            montant.includes(searchTerm) ||
            ancien_solde.includes(searchTerm) ||
            nouveau_solde.includes(searchTerm) ||
            type.includes(searchTerm);
      });
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllChargements();
  },
  created() {
    document.title =
      "Chargements | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    highlightMatches(text) {
      const matchExists = text.toLowerCase().includes(this.search.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, 'ig');
      return text.replace(re, matchedText => `<span style="background-color:#f1c40f;" >${matchedText}</span>`);
    },
    getAllChargements() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllChargementByclient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listChargements = [...response.data.data];
          console.log("no data is", this.listChargements);
          // this.solde.airtime = response.data.solde_airtime;
          // this.solde.data = response.data.volume_data;
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
      this.getAllChargements();
    },

    exportExcel() {
      saveExcel({
        data: this.listChargements,
        fileName: "Mes_Chargements",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "portefeuille", title: "Flotte" },
          { field: "operateur", title: " Operateur" },
          { field: "type_portefeuille", title: " Type portefeuille" },
          { field: "montant", title: " Valeur chargée" },
          { field: "ancien_solde", title: "Solde avant" },
          { field: "nouveau_solde", title: "Solde après" },
          { field: "type", title: "Type chargement" },
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
