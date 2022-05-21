<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Historique des activations</h2>
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
      <button @click="getAllHistoriqueActivation" class="btn btn-light shadow-md mr-2">
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
            <th>TYPE</th>
            <th>COMPTE</th>
            <th>BÉNÉFICIAIRE</th>
            <th>N° BÉNÉFICIAIRE</th>
            <th>COÛT (FCFA)</th>
            <th>FLOTTE</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listActivation.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(activation, activationKey) in filteredListActivations"
            :key="activationKey"
          >
            <td class="w-40 border border-slate-300" 
            v-html="highlightMatches(activation?.create_time)">
              
            </td>
            <td class="w-10 border border-slate-300" 
            v-html="highlightMatches(activation?.type)">
              
            </td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(activation?.nom_client)">
              
            </td>
            <td class="w-40 border border-slate-300" 
            v-html="highlightMatches(activation?.nom_beneficiaire)">
              
            </td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(activation?.numero_beneficiaire)">
              
            </td>
            <td class="w-20 border border-slate-300"><span>{{activation?.montant}}</span>
            </td>
            <td class="w-20 border border-slate-300" 
            v-html="highlightMatches(activation?.portefeuille)">
              
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
      listActivation: [],
      nom_complet: '',
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
    filteredListActivations() {
      return this.listActivation?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const type = row.type?.toLowerCase();
        const nom_client = row.nom_client?.toLowerCase();
        const nom_beneficiaire  = row.nom_beneficiaire.toLowerCase();
        const numero_beneficiaire  = row.numero_beneficiaire.toLowerCase();
        const montant = row.montant;
        const portefeuille = row.portefeuille;
        const searchTerm = this.search?.toLowerCase();

        return (
            create_time.includes(searchTerm) ||
            type.includes(searchTerm) ||
            nom_client.includes(searchTerm) ||
            nom_beneficiaire.includes(searchTerm) ||
            numero_beneficiaire.includes(searchTerm) ||
            montant.includes(searchTerm) ||
            portefeuille.includes(searchTerm)
        );
      });
    }, 
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllHistoriqueActivation();
  },
  created() {
    document.title =
      "Historique Activation | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {

    highlightMatches(text) {
      const matchExists = text.toLowerCase()
      .includes(this.search?.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, 'ig');
      return text.replace(re, matchedText => `<span style="background-color:#f1c40f;" >${matchedText}</span>`);
    },

    getAllHistoriqueActivation() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllActivationByUser/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listActivation = [...response.data.data];
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
      this.getAllHistoriqueActivation();
    },

    exportExcel() {
      saveExcel({
        data: this.listActivation,
        fileName: "Historique_activations",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "type", title: "Type" },
          { field: "nom_client", title: "Compte" },
          { field: "nom_beneficiaire", title: "Bénéficiaire" },
          { field: "numero_beneficiaire", title: "N° Bénéficiaire" },
          { field: "montant", title: "Coût (FCFA)" },
          { field: "portefeuille", title: "Flotte" },
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
