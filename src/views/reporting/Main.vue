<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Reporting des transactions</h2>
        <div class="text-right font-bold text-2xl">
        Total transaction <u>{{ solde.solde }}</u> | Montant total (FCFA) <u>{{ solde.gain }} </u>
    </div>
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
      <button @click="getAllChargementCollect" class="btn btn-light shadow-md mr-2">
        <i class="fas fa-refresh mr-2"></i>&nbsp;Rafraichir
      </button>
        <div class="col-span-2">
        <label for="pos-form-1" class="text-xs mr-2"> Utilisateur</label>
        </div>
        <TomSelect
          v-model="selectedService"
          :options="{
            placeholder: 'Selectionner le bénéficiaire',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Bénéficiaire',
              },
            },
          }"
          class="w-1/6"
        >
          <option
            v-for="(recipient, recipientKey) in recipients"
            :value="recipient.nom"
          >
            {{ recipient.nom }} {{ recipient.prenom }} | {{ recipient.email }} | {{ recipient.telephone }}
          </option>
        </TomSelect>
          <div class="col-span-2">
            <label for="pos-form-1" class="text-xs ml-2 mr-2"> Type Service</label>
          </div>
        <TomSelect
          v-model="selectedTypeService"
          :options="{
            placeholder: 'Selectionner le type de service',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Type service',
              },
            },
          }"
          class="w-1/6"
        >
          <option
            v-for="(etat, etatKey) in listTypeService"
            :value="etat.libelle"
          >
            {{ etat.libelle }}
          </option>
        </TomSelect>
        <button @click="getReporting" class="btn btn-primary shadow-md ml-2">
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
            <th>UTILISATEUR</th>
            <th>TYPE SERVICE</th>
            <th>NOMBRE TRANSACTION</th>
            <th>MONTANT (FCFA)</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listReporting.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(reporting, reportingKey) in listReporting"
            :key="reportingKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="reporting">{{ reporting.date_creation }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="reporting">{{ reporting.nom }} {{ reporting.prenom }} ({{ reporting.email }})</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="reporting">{{ reporting.nbre }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="reporting">{{ reporting.ca }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="reporting">{{ reporting.ca }}</span>
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
      newOrderModal : ref(false),
      addItemModal : ref(false),
      selectedTypeService: "",
      selectedRecipient: "",
      selectedService : "",
      recipients : [],
      listTypeService: [
        { id: "0", libelle: "Tous", ischecked: false },
        { id: "1", libelle: "Data", ischecked: false },
        { id: "2", libelle: "Airtime", ischecked: false },
      ],
      listReporting: [],
      solde: {'solde': '', 'gain': '', 'last_transaction':''},
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
    filteredListReporting() {
      return this.listReporting.filter(row => {
        const create_time = row.create_time.toLowerCase();
        const nom = row.nom.toLowerCase();
        const nbre = row.nbre.toLowerCase();
        const ca = row.ca.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return create_time.includes(searchTerm) ||
            nom.includes(searchTerm) ||
            nbre.includes(searchTerm) ||
            ca.includes(searchTerm)
      });
    }
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllRecipient();
  },


  created() {
    document.title =
      "Reporting transactions | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    highlightMatches(text) {
      const matchExists = text.toLowerCase().includes(this.search.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(this.search, 'ig');
      return text.replace(re, matchedText => `<span style="background-color:#f1c40f;" >${matchedText}</span>`);
    },

    getAllRecipient() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}login/getAllUser`
        )
        .then((response) => {
          this.isLoading = false;
          this.recipients = [...response.data];
          console.log(this.recipients);
        })
        .catch((error) => {
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getReporting() {
      this.isLoading = true;
      const data = {
            client: 362,
            date_debut: "2022/05/17",
            date_fin: "2022/05/17",
            type_report: 0,
            type_service: "0",
            user_id: "517",
       };
      axios
        .post(`${Config.BASE_URL}services/getReporting`, data)
        .then((response) => {
          console.log(response.data);
          this.isLoading = false;
          this.listReporting = [...response.data.data];
          this.solde.solde = response.data.infocompte.solde;
          this.solde.gain = response.data.infocompte.gain;
          this.solde.last_transaction = response.data.infocompte.last_transaction;
          this.totalPages = response.data.last_page;
          this.totalRecords = response.data.total;
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

    onPageChange(page) {
      this.page = page;
      this.getReporting();
    },

    exportExcel() {
      saveExcel({
        data: this.listReporting,
        fileName: "Mes_Chargement_CompteMoney",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "nom", title: "Utilisateur" },
          { field: "nbre", title: "Nombre transaction" },
          { field: "ca", title: "Montant (FCFA)" },
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
