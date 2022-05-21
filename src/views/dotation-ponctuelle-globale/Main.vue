<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Demande de dotation</h2>
    <div class="text-right font-bold text-2xl">
      Solde compte <u>{{ solde.solde }} FCFA</u> | Airtime <u>{{ solde.airtime }} FCFA</u> | Data <u>{{ solde.data }} GB</u> | SMS <u>{{ solde.sms }} </u> 
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
      <button v-on:click="newDemande('Choix du service')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllDemandeDotation" class="btn btn-light shadow-md mr-2">
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
            <th>DATE CRÉATION</th>
            <th>RÉFÉRENCE</th>
            <th>SERVICE</th>
            <th>VALEUR</th>
            <th>MONTANT TTC (FCFA)</th>
            <th>EMETTEUR</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listPonctuelleGlobale.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(demande, demandeKey) in filteredListPonctuelleGlobale"
            :key="demandeKey"
            class=""
          >
            <td v-html="highlightMatches(demande.create_time)" 
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(demande.reference)" 
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(demande.service)" 
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(demande.valeur)" 
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(demande.montant)" 
            class="w-40 border border-slate-300">
            </td>
            <td v-html="highlightMatches(demande.creer_par)" 
            class="w-40 border border-slate-300">
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
<!-- BEGIN: New Order Modal -->
  <Modal :show="newOrderModal" @hidden="newOrderModal = false">
    <ModalHeader>
       <b class="text-2xl">{{title}}</b>
      <!-- <h2 class="font-medium text-base mr-auto">Transférer flotte</h2> -->
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div class="col-span-12">
        <label for="service" class="form-label">
          <b>Type service <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedService"
          :options="{
            placeholder: 'Selectionner le type de service',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Type de service',
              },
            },
          }"
          class="w-full"
        >
        <option></option>
          <option
            v-for="(service, serviceKey) in listService"
            :key="serviceKey" :value="service.sigle"
          >
            {{ service.libelle }}
          </option>
        </TomSelect>
      </div>
       <div
       v-show="selectedService === 'AIRTIME' || selectedService === 'DATA' || selectedService === 'SMS'"
        v-if="selectedService === 'AIRTIME' ? this.label = 'Montant (FCFA)'
        : selectedService === 'DATA' ? this.label = 'Volume data (GB)'
        : selectedService === 'SMS' ? this.label = 'Nombre'
        : '' "
        class="col-span-12"
      >
      <label for="montant" class="form-label">
          <b>{{label}} <span class="text-danger">*</span></b>
      </label>
        <number
          name="montant"
          placeholder="100"
          class="form-control"
          v-model="listInfoCompte"
          v-bind="number"
        >
        </number>
      </div>
    </ModalBody>
    <ModalFooter class="text-right">
      <button
        type="button"
        @click="closeModal"
        class="btn btn-danger w-32 mr-1"
      >
        Fermer
      </button>
      <button type="button" 
      @click="demandeDotation"
      class="btn btn-primary w-32">Enregistrer</button>
    </ModalFooter>
  </Modal>
  <!-- END: New Order Modal -->
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
      label: "",
      selectedService: "",
      serviceIs: "",
      listPonctuelleGlobale: [],
      listService: [
      { id: "0", libelle: "DATA", ischecked: false },
      { id: "1", libelle: "AIRTIME", ischecked: false },
      { id: "2", libelle: "SMS", ischecked: false },
      ],
      solde: {'solde': '', 'airtime': '', 'sms': '', 'data': ''},
      page: 1,
      isLoading: false,
      fullPage: true,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
      enterpageno: "",
      search: "",
      number: {
        decimal: ".",
        separator: " ",
        precision: 2,
      },
    };
  },

  computed: {

    filteredListPonctuelleGlobale() {
      return this.listPonctuelleGlobale?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const reference = row.reference.toLowerCase();
        const valeur = row.valeur?.toLowerCase();
        const montant = row.montant?.toLowerCase();
        const creer_par = row.creer_par?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          reference.includes(searchTerm) ||
          valeur.includes(searchTerm) ||
          montant.includes(searchTerm) ||
          creer_par.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllDemandeDotation();
  },


  created() {
    document.title =
      "Demande de dotation | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newDemande(nom) {
      this.newOrderModal = true
      this.title = nom;
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedService = ""
    },

    getAllDemandeDotation() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllDotationInstantanee/${this.user.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listPonctuelleGlobale = [...response.data.data];
          this.solde.solde = response.data.solde_compte;
          this.solde.airtime = response.data.solde_airtime;
          this.solde.sms = response.data.solde_sms;
          this.solde.data = response.data.solde_data;
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

    demandeDotation() {
      this.isLoading = true;
      const data = {
        canal: this.selectedTypeCanal,
        message: this.envoiSMS.message,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}${url}`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.closeModal();
            this.getAllDemandeDotation();
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
      this.getAllDemandeDotation();
    },

    exportExcel() {
      saveExcel({
        data: this.listPonctuelleGlobale,
        fileName: "Demande_Dotation_Ponctuelle_Globale",
        columns: [
          { field: "create_time", title: "Date création" },
          { field: "reference", title: "Reférence" },
          { field: "service", title: "Service" },
          { field: "valeur", title: "Valeur" },
          { field: "montant", title: "Montant Ttc (Fcfa)" },
          { field: "creer_par", title: "Emetteur" },
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
