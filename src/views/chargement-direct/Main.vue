<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Chargement des flottes</h2>
    <div class="text-right font-bold text-2xl">
      Soldes <u>{{ solde.solde }} FCFA</u> 
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
      <button v-on:click="newChargement('Formulaire de chargement de flotte')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllChargementDirect" class="btn btn-light shadow-md mr-2">
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
            <th>PORTEFEUILLE</th>
            <th>VALEUR CHARGÉE</th>
            <th>SOLDE AVANT</th>
            <th>SOLDE APRÈS</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listChargementDirect.length" >
             <td colspan="8">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(direct, directKey) in filteredListChargementDirect"
            :key="directKey"
            class=""
          >
            <td v-html="highlightMatches(direct.create_time)" class="w-40 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.nom)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.operateur)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.telephone)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.type_portefeuille)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.montant)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.ancien_solde)" class="w-20 border border-slate-300" 
                >
            </td>
            <td v-html="highlightMatches(direct.nouveau_solde)" class="w-20 border border-slate-300" 
                >
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
        <label for="pos-form-1" class="text-xs font-bold mb-2">Bénéficiaire<span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedRecipient"
          @change="getPortefeuilleById()"
          :options="{
            placeholder: 'Selectionner le bénéficiaire',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Bénéficiaire',
              },
            },
          }"
          class="w-full"
        >
        <option value=""></option>
          <option
            v-for="(recipient, recipientKey) in listRecipient"
            :key="recipientKey" :value="recipient.id" 
          >
            {{ recipient.nom }} | {{ recipient.email }} | {{ recipient.contact }}
          </option>
        </TomSelect>
      </div>
      <div class="col-span-12 text-center justify-content-center font-bold text-1xl">
        <span class="float-left"> SOLDE AIRTIME :  FCFA</span>
        <span class="float-right">SOLDE DATA :  MB</span>
      </div>
      <hr>
      <div class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Flotte<span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedFlotte"
          :options="{
            placeholder: 'Selectionner la flotte',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Flotte',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option
            v-for="(flotte, flotteKey) in listFlotte"
            :key="flotteKey" :value="flotte.id" 
          >
            {{ flotte.operateur }}
          </option>
        </TomSelect>
      </div>
      <div class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Type service<span class="text-danger">*</span></label>
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
          <option
            v-for="(service, serviceKey) in listService"
            :key="serviceKey" :value="service.id" 
          >
            {{ service.libelle }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="selectedService === 'Data' || selectedService === 'Airtime'"
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >{{selectedService === 'Data' ? label = 'Volume DATA' 
          : selectedService === 'Airtime' ? label = "Montant" 
          : label = "" }} <span class="text-danger">*</span></label
        >
        <number
          name="montant"
          class="form-control"
          placeholder="Ex: 10 000"
          v-model="chargerFlotte.montant"
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
        Annuler
      </button>
      <button type="button" class="btn btn-primary w-32">
        Enregistrer
      </button>
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
      nom: "",
      selectedRecipient: "",
      selectedFlotte: "",
      selectedService: "",
      chargerFlotte: {
        montant: null,
      },
      filterFlotte: [],
      listFlotte: [],
      listRecipient: [],
      listChargementDirect: [],
      listService: [
        { id: "1", libelle: "Airtime", ischecked: false },
        { id: "2", libelle: "Data", ischecked: false },
      ],
        solde: {'solde': ''},
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

    filteredListChargementDirect() {
      return this.listChargementDirect?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const ancien_solde = row.ancien_solde?.toLowerCase();
        // const nomcomplet = `${row.nom} ${row.prenom}`.toLowerCase();
        const nom = row.nom.toLowerCase();
        const telephone = row.telephone?.toLowerCase();
        const montant = row.montant?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const nouveau_solde = row.nouveau_solde?.toLowerCase();
        const type_portefeuille = row.type_portefeuille?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          ancien_solde.includes(searchTerm) ||
          nom.includes(searchTerm) ||
          telephone.includes(searchTerm) ||
          montant.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          nouveau_solde.includes(searchTerm) ||
          type_portefeuille.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllChargementDirect();
  },


  created() {
    document.title =
      "Chargement direct | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newChargement(nom) {
      this.newOrderModal = true
      this.title = nom;
      this.getAllBeneficiaire();
    },

    closeModal() {
      this.newOrderModal = false
      this.selectedRecipient = ''
      this.selectedService = ''
    },

    getPortefeuilleById(event) {
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllportefeuilleByClient/${this.selectedRecipient}`
        )
        .then((response) => {
           console.log('beneficiaire is',response)
          this.listFlotte = [...response.data];
          console.log(this.listFlotte);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllBeneficiaire() {
      axios
        .get(
          `${Config.BASE_URL}login/getAllUserClient`
        )
        .then((response) => {
           console.log('beneficiaire is',response)
          this.listRecipient = [...response.data];
          this.listRecipient.forEach(element => element.nom = element.nom + " " + element.prenom);
          console.log(this.listRecipient);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllChargementDirect() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllChargementDirect/${this.page}`
        )
        .then((response) => {
          console.log(response)
          this.isLoading = false;
          this.listChargementDirect = [...response.data.data];
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
      this.getAllChargementDirect();
    },

    exportExcel() {
      saveExcel({
        data: this.listChargementDirect,
        fileName: "Chargement_Flottes_Direct",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "nom", title: "Bénéficiaire" },
          { field: "operateur", title: "Flotte" },
          { field: "telephone", title: "Téléphone" },
          { field: "type_portefeuille", title: "Portefeuille" },
          { field: "montant", title: "Valeur chargée" },
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
