<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">
      Historique des transactions
    </h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div
      class="
        intro-y
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
      <button @click="getAllHistoriqueTransactions" class="btn btn-light shadow-md mr-2">
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
            <th>ETAT</th>
            <th>DATE</th>
            <th>EMETTEUR</th>
            <th>BÉNÉFICIAIRE</th>
            <th>SERVICE</th>
            <th>COÛT (FCFA)</th>
            <th>NUMÉRO</th>
            <th>OPÉRATEUR</th>
            <!-- <th>TYPE TRANSACTION</th>
            <th>SIM SOURCE</th> -->
          </tr>
        </thead>
        <tbody>
          <tr class="w-full text-center justify-content-center text-2xl">
            <div v-if="listHistoriques.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(historique, historiqueKey) in listHistoriques.data"
            :key="historiqueKey"
            class=""
          >
            <td class="w-40 text-center">
               <span  v-if="historique"
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-yellow-400 rounded text-dark-700':
                    historique.etat === 'en attente',
                  'bg-green-500 rounded text-white':
                    historique.etat === 'traité',
                }"
              >
                {{ historique.etat }}
              </span>
              <!-- <span v-if="historique">{{ historique.etat }}</span> -->
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.create_time }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.emetteur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.nom + " " + historique.prenom }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.service }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.cout }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.telephone }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.operateur }}</span>
            </td>
            <!-- <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.type_transaction }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="historique">{{ historique.sim_source }}</span>
            </td> -->
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
      listHistoriques: [],
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
    filteredListHistoriqueTransactions() {
      return this.listHistoriqueTransactions.filter((row) => {
        const date = row.create_time.toLowerCase();
        const service = row.service.toLowerCase();
        const cout = row.cout.toLowerCase();
        const telephone = row.telephone.toLowerCase();
        const operateur = row.operateur.toLowerCase();
        const etat = row.etat.toLowerCase();
        const emetteur = row.emetteur.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          date.includes(searchTerm) ||
          service.includes(searchTerm) ||
          cout.includes(searchTerm) ||
          telephone.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          etat.includes(searchTerm) ||
          emetteur.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllHistoriqueTransactions();
  },
  created() {
    document.title =
      "Historique | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    getAllHistoriqueTransactions() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}services/getAllTransactionByClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listHistoriques = response.data;
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
      this.getAllHistoriqueTransactions();
    },

    exportExcel() {
      saveExcel({
        data: this.listHistoriques.data,
        fileName: "HistoriqueTransactions",
        columns: [
          { field: "etat", title: "Etat" },
          { field: "create_time", title: "Date" },
          { field: "emetteur", title: "Emetteur" },
          { field: "nom + prenom", title: "Bénéficiaire" },
          { field: "service", title: "Service" },
          { field: "cout", title: "Coût(FCFA)" },
          { field: "telephone", title: "Numéro" },
          { field: "operateur", title: "Opérateur" },
          { field: "type_transaction", title: "Type Transaction" },
          { field: "sim_source", title: "SIM source" },
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
