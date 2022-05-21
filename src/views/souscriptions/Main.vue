<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">
      Liste des souscriptions
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
      <button @click="getAllSouscriptions" class="btn btn-light shadow-md mr-2">
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
            <th>SERVICE</th>
            <th>PÉRIODE</th>
            <th>COÛT (FCFA)</th>
            <th>DATE DÉBUT</th>
            <th>
              DATE DERNIÈRE EXÉCUTION
            </th>
            <th>
              DATE PROCHAÎNE EXÉCUTION
            </th>
            <th>DESTINATAIRE</th>
            <th>FLOTTE</th>
            <!-- <th>ACTION</th> -->
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listSouscriptions.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(souscription, souscriptionKey) in filteredListSouscriptions"
            :key="souscriptionKey"
            class=""
          >
            <td class="w-60 border border-slate-300">
              <span v-if="souscription">{{ souscription.create_time }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="souscription">{{ souscription.service }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="souscription">{{ souscription.periode }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="souscription">{{ souscription.cout }}</span>
            </td>
            <td class="w-60 border border-slate-300">
              <span v-if="souscription">{{ souscription.date_debut }}</span>
            </td>
            <td class="w-80 border border-slate-300">
              <span v-if="souscription">{{
                souscription.last_chargement
              }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="souscription">{{ souscription.next_execution }}</span>
            </td>
            <td class="w-60 border border-slate-300">
              <span v-if="souscription">{{
                souscription.prenom + " " + souscription.nom
              }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="souscription">{{ souscription.operateur }}</span>
            </td>
            <!-- <td class="w-40 border border-slate-300">
              <button class="btn btn-dark shadow-md mr-2">
                <i class="fas fa-edit"></i>&nbsp;Modifier
              </button>
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
      listSouscriptions: [],
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
    filteredListSouscriptions() {
      return this.listSouscriptions.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const service = row.service?.toLowerCase();
        const periode = row.periode?.toLowerCase();
        const cout = row.cout?.toLowerCase();
        const date_debut = row.date_debut?.toLowerCase();
        const last_chargement = row.last_chargement?.toLowerCase();
        const next_execution = row.next_execution?.toLowerCase();
        const prenom = row.next_execution?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          service.includes(searchTerm) ||
          periode.includes(searchTerm) ||
          cout.includes(searchTerm) ||
          date_debut.includes(searchTerm) ||
          last_chargement.includes(searchTerm) ||
          next_execution.includes(searchTerm) ||
          prenom.includes(searchTerm) ||
          operateur.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllSouscriptions();
  },
  created() {
    document.title =
      "Souscriptions | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    getAllSouscriptions() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}services/getAllSouscriptionByClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listSouscriptions = [...response.data.data];
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
      this.getAllSouscriptions();
    },

    exportExcel() {
      saveExcel({
        data: this.listSouscriptions,
        fileName: "Mes_Souscriptions",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "service", title: "Service" },
          { field: "periode", title: " Période" },
          { field: "cout", title: "Coût (fcfa)" },
          { field: "date_debut", title: "Date début" },
          { field: "last_chargement", title: "Date dernière exécution" },
          { field: "next_execution", title: "Date prochaîne exécution" },
          { field: "nom", title: "Destinataire" },
          { field: "operateur", title: "Flotte" },
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
