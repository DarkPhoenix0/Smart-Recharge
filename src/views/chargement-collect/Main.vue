<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Chargement Flotte Collecte</h2>
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
            <th>DATE</th>
            <th>BÉNÉFICIAIRE</th>
            <th>FLOTTE</th>
            <th>TÉLÉPHONE</th>
            <th>MONTANT</th>
            <th>SOLDE AVANT</th>
            <th>SOLDE APRÈS</th>
            <th>DETAIL</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listChargementCollect.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(collect, collectKey) in filteredListChargementCollect"
            :key="collectKey"
            class=""
          >
            <td v-html="highlightMatches(collect?.create_time)" class="w-40 border border-slate-300" 
                ></td>
            <td class="w-60 border border-slate-300" 
                ><span v-if="collect">{{ collect.nom }} {{ collect.prenom }}</span>
                </td>
            <td v-html="highlightMatches(collect?.operateur)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(collect?.telephone)" class="w-20 border border-slate-300" 
                ></td>
            <td class="w-40 border border-slate-300">
              <span v-if="collect">{{ collect.montant }}</span>
            </td>
            <td v-html="highlightMatches(collect?.ancien_solde)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(collect?.nouveau_solde)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(collect?.code_transaction)" class="w-20 border border-slate-300" 
                ></td>
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
      newOrderModal : ref(false),
      addItemModal : ref(false),
      title: "",
      solde: {'solde': ''},
      listChargementCollect: [],
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
    filteredListChargementCollect() {
      return this.listChargementCollect?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const prenom = row.prenom?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const ancien_solde = row.ancien_solde?.toLowerCase();
        const telephone = row.telephone?.toLowerCase();
        const nouveau_solde = row.nouveau_solde?.toLowerCase();
        // const montant = row.montant?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          prenom.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          ancien_solde.includes(searchTerm) ||
          telephone.includes(searchTerm) ||
          nouveau_solde.includes(searchTerm)
          // montant.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllChargementCollect();
  },


  created() {
    document.title =
      "Chargement collect | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {

    highlightMatches(text) {
      const matchExists = text
        .toLowerCase()
        .includes(this.search.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, "ig");
      return text.replace(
        re,
        (matchedText) =>
          `<span style="background-color:#f1c40f;" >${matchedText}</span>`
      );
    },

    closeModal() {
      this.newOrderModal = false
    },

    getAllChargementCollect() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllChargementCollect/${this.page}`
        )
        .then((response) => {
           console.log('collect is',response)
          this.isLoading = false;
          this.listChargementCollect = [...response.data.data];
          // this.solde.solde = response.data.solde;
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
      this.getAllChargementCollect();
    },

    exportExcel() {
      saveExcel({
        data: this.listChargementCollect,
        fileName: "Chargement_Flotte_Collecte",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "prenom", title: "Bénéficiaire" },
          { field: "operateur", title: "Flotte" },
          { field: "telephone", title: "Téléphone" },
          { field: "montant", title: "Montant" },
          { field: "ancien_solde", title: "Solde avant" },
          { field: "nouveau_solde", title: "Solde après" },
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
