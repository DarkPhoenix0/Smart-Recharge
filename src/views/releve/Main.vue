<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Mon Relévé de compte</h2>
  <div class="text-right font-bold text-2xl">
    Solde <u>{{ solde.solde }} FCFA</u>
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
      <button @click="getAllReleve" class="btn btn-light shadow-md mr-2">
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
            <th>DATE CRÉATION</th>
            <th>TYPE</th>
            <th>MONTANT</th>
            <th>SOLDE AVANT</th>
            <th>SOLDE APRÈS</th>
            <th>REFÉRENCE TRANSACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listReleve.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(releve, releveKey) in filteredListReleve"
            :key="releveKey"
            class=""
          >
            <td 
            v-html="highlightMatches(releve?.create_time)"
            class="w-20 border border-slate-300"></td>
            <!-- <td class="w-60 border border-slate-300">
              <span v-if="releve">{{ releve.create_time }}</span>
            </td> -->
            <td 
            v-html="highlightMatches(releve?.type)"
            class="w-20 border border-slate-300"></td>
            <td 
            v-html="highlightMatches(releve?.montant)"
            class="w-20 border border-slate-300"></td>
            <td 
            v-html="highlightMatches(releve?.solde_avant)"
            class="w-20 border border-slate-300"></td>
            <td 
            v-html="highlightMatches(releve?.solde_apres)"
            class="w-20 border border-slate-300"></td>
            <td 
            v-html="highlightMatches(releve?.numero_transaction)"
            class="w-20 border border-slate-300"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- END: Data List -->
    <!-- BEGIN: Pagination -->
    <div
      class="col-span-12 text-right"
    >
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
      listReleve: [],
      solde: { solde: ""},
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
    filteredListReleve() {
      
      return this.listReleve.filter((row) => {
        const create_time = row.create_time.toLowerCase();
        const montant = row.montant.toLowerCase();
        const type = row.type.toLowerCase();
        const solde_avant = row.solde_avant.toLowerCase();
        const solde_apres = row.solde_apres.toLowerCase();
        const numero_transaction = row.numero_transaction.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          montant.includes(searchTerm) ||
          type.includes(searchTerm) ||
          solde_avant.includes(searchTerm) ||
          solde_apres.includes(searchTerm) ||
          numero_transaction.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllReleve();
  },
  created() {
    document.title =
      "Relévé de compte | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {

    highlightMatches(text) {
      const matchExists = text?.toLowerCase()
        .includes(this.search.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, "ig");
      return text.replace(
        re,
        (matchedText) =>
          `<span style="background-color:#f1c40f;" >${matchedText}</span>`
      );
    },

    getAllReleve() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllMouvementCompte/${this.page}`
        )
        .then((response) => {
          console.log('list is:',response)
          this.isLoading = false;
          this.listReleve = [...response.data.data];
          this.solde.solde = response.data.solde;
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
      this.getAllReleve();
    },

    exportExcel() {
      saveExcel({
        data: this.listReleve,
        fileName: "Mon_Releve",
        columns: [
          { field: "create_time", title: "Date création" },
          { field: "type", title: "Type" },
          { field: "montant", title: "Montant" },
          { field: "solde_avant", title: "Solde avant" },
          { field: "solde_apres", title: "Solde après" },
          { field: "numero_transaction", title: "Référence transaction" },
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
