<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8" v-if="viewListDotPonctuelleClt">
    <h2 class="text-2xl font-bold font-medium mr-auto">Dotations ponctuelles clientes</h2>
    <div class="text-right font-bold text-2xl">
       Solde compte <u>{{ solde.solde }} FCFA</u> | Airtime <u>{{ solde.airtime }} FCFA</u> | DATA
      <u>{{ solde.data }} GB</u> | SMS <u>{{ solde.data }} </u>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListDotPonctuelleClt">
    <div
      class="
        col-span-12
        flex flex-wrap
        sm:flex-nowrap
        items-center
        mt-2
      "
    >
      <button v-on:click="newDotation('nouveau','Formulaire de creation de dotation')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-add"></i>&nbsp; Nouveau
      </button>
      <button v-on:click="newDotation('airtime','Dotation Ponctuelle Airtime')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-globe"></i>&nbsp;  Dotation airtime en masse
      </button>
      <button v-on:click="newDotation('data','Dotation Ponctuelle Data')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-mobile"></i>&nbsp;  Dotation data en masse
      </button>
      <button @click="getAllDotPonctuelleClt" class="btn btn-light shadow-md mr-2">
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
    <div class="col-span-12">
      <table class="table border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>DATE CRÉATION</th>
            <th>BÉNÉFICIAIRE</th>
            <th>EMAIL</th>
            <th>SERVICE</th>
            <th>VALEUR</th>
            <th>DATE EFFET</th>
            <th>DERNIÈRE UTILISATION</th>
            <th>SOLDE</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listDotationPonctuelleClt.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(dotationclt, dotationcltKey) in filteredListDotationClient"
            :key="dotationcltKey"
            class=""
          >
            <td v-html="highlightMatches(dotationclt?.create_time)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.beneficiaire)" class="w-80 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.email)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.service)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.valeur)" class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.date_effet)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.derniere_utilisation)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt?.solde)" class="w-40 border border-slate-300" 
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
  <div class="flex items-center mt-8" v-if="viewListVerification">
    <h2 class="text-2xl font-bold font-medium mr-auto">{{title}}</h2>
    <div class="text-right font-bold text-2xl mr-4">
      Solde Airtime <u>{{ solde.airtime }} FCFA</u>
    </div>
    <button
        @click="toggleView"
        type="button"
        class="btn btn-danger w-24 ml-2"
      >
        Fermer
      </button>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListVerification">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <div v-if="vue === 'airtime'"
        class="col-span-12 sm:col-span-12"
      >
          <a href="/model/model_chargement_dotation_airtime.xlsx">
            <button class="btn btn-dark shadow-md mr-2">
                <i class="fa fa-download"></i>&nbsp; Télécharger le modèle
            </button>
          </a>
          <input
          class="mr-2"
            type="file"
            @change="fileToJson"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <button v-on:click="verifier"
          class="btn btn-primary shadow-md">
          <i class="fas fa-refresh"></i>&nbsp; Vérifier
        </button>
      </div>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--        Showing 1 to 10 of 150 entries-->
      </div>
      <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
        <div class="w-65 relative text-slate-500">
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
    <div class="col-span-12">
      <table class="table border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>BÉNÉFICIAIRE </th>
            <th>EMAIL</th>
            <th>MONTANT</th>
            <th>RAPPORT D'INTÉGRITÉ DU FICHIER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listDotAirtimeFile.length">Aucune donnée disponible</div>
          </tr>
          <tr
             v-for="(airtime, airtimeKey) in filteredListDotAirtimeFile"
            :key="airtimeKey"
            class=""
          >
            <td v-html="highlightMatches(airtime?.beneficiaire)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.email)" class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.montant)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.message)" class="w-60 border border-slate-300" 
                ></td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-10">
        <div class="text-right font-bold text-2xl mr-2">   
            {{updateValue}} Montant à recharger (TTC): <u> FCFA</u>
        </div>
        <button @click="getCollect" class="btn btn-primary shadow-md ml-2">
            Valider
        </button>
        <button @click="toggleView" class="btn btn-danger shadow-md ml-2">
          <i class="fas fa-undo"></i>&nbsp; Annuler
        </button>
      </div>
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
  <div class="flex items-center mt-8" v-if="viewListVerificationData">
    <h2 class="text-2xl font-bold font-medium mr-auto">{{title}}</h2>
    <div class="text-right font-bold text-2xl mr-4">
      Solde Data <u>{{ solde.data }} FCFA</u>
    </div>
    <button
        @click="toggleView"
        type="button"
        class="btn btn-danger w-24 ml-2"
      >
        Fermer
      </button>
  </div>
  <!-- BEGIN: New Order Modal -->
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListVerificationData">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <div v-if="vue === 'data'"
        class="col-span-12 sm:col-span-12"
      >
          <a href="/model/model_chargement_dotation_data.xlsx">
            <button class="btn btn-dark shadow-md mr-2">
                <i class="fa fa-download"></i>&nbsp; Télécharger le modèle
            </button>
          </a>
          <input
          class="mr-2"
            type="file"
            @change="fileToJson"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <button v-on:click="verifier"
          class="btn btn-primary shadow-md">
          <i class="fas fa-refresh"></i>&nbsp; Vérifier
        </button>
      </div>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--        Showing 1 to 10 of 150 entries-->
      </div>
      <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
        <div class="w-65 relative text-slate-500">
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
            <th>BÉNÉFICIAIRE </th>
            <th>EMAIL</th>
            <th>VOLUME (MB)</th>
            <th>RAPPORT D'INTÉGRITÉ DU FICHIER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listDataFile.length">Aucune donnée disponible</div>
          </tr>
          <tr
             v-for="(data, dataKey) in filteredListDataFile"
            :key="dataKey"
            class=""
          >
            <td v-html="highlightMatches(data?.beneficiaire)" 
            class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(data?.email)" 
            class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(data?.montant)" 
            class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(data?.message)" 
            class="w-60 border border-slate-300" 
                ></td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-10">
        <div class="text-right font-bold text-2xl mr-2">   
            Volume à recharger (TTC): <u>{{ this.somme }} {{updateValue}} MB</u>
        </div>
        <button @click="getCollect" class="btn btn-primary shadow-md ml-2">
            Valider
        </button>
        <button @click="toggleView" class="btn btn-danger shadow-md ml-2">
          <i class="fas fa-undo"></i>&nbsp; Annuler
        </button>
      </div>
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
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div v-if="vue === 'nouveau'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Bénéficiaire <span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedRecipient"
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
            {{ recipient.nom }} {{ recipient.prenom }} | {{ recipient.email }} | {{ recipient.contact }}
          </option>
        </TomSelect>
      </div>
      <div v-if="vue === 'nouveau'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Type service <span class="text-danger">*</span></label>
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
            :key="serviceKey" :value="service.id"
          >
            {{ service.libelle }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="selectedService == '1' || selectedService == '2'"
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >{{selectedService == '1' ? label = "Volume data (MB)" 
          : selectedService == '2' ? label = "Montant (FCFA)" 
          : label = "" }} <span class="text-danger">*</span></label
        >
        <number
          name="montant"
          class="form-control"
          placeholder="100"
          v-model="dotationPonctuelleClt.montant"
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
      @click="dotationPClt"
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
import XLSX from "xlsx/dist/xlsx.full.min.js";
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
      vue: "",
      somme: 0,
      viewListDotPonctuelleClt: true,
      viewListVerification: false,
      dotationPonctuelleClt: {
        file: null,
        montant: null,
        data: [],
      },
      selectedService : "",
      selectedRecipient : "",
      listService: [],
      solde: {'solde': '','airtime': '','data': '','sms': '',},
      listRecipient: [],
      listDotationPonctuelleClt: [],
      listDotAirtimeFile: [],
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

    filteredListDotAirtimeFile() {
      return this.listDotAirtimeFile?.filter((row) => {
        const beneficiaire = row.beneficiaire?.toLowerCase();
        const email = row.email?.toLowerCase();
        const montant = row.montant?.toLowerCase();
        const message = row.message?.toLowerCase();
        const searchTerm = this.search?.toLowerCase();

        return (
          beneficiaire?.includes(searchTerm) ||
          email?.includes(searchTerm) ||
          montant?.includes(searchTerm) ||
          message?.includes(searchTerm)
        );
      });
    },

    filteredListDotationClient() {
      return this.listDotationPonctuelleClt?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const beneficiaire = row.beneficiaire?.toLowerCase();
        const email = row.email?.toLowerCase();
        const service = row.service?.toLowerCase();
        const valeur = row.valeur?.toLowerCase();
        const date_effet = row.date_effet?.toLowerCase();
        const derniere_utilisation = row.derniere_utilisation?.toLowerCase();
        const solde = row.solde?.toLowerCase();
        const searchTerm = this.search?.toLowerCase();

        return (
          create_time?.includes(searchTerm) ||
          beneficiaire?.includes(searchTerm) ||
          email?.includes(searchTerm) ||
          service?.includes(searchTerm) ||
          valeur?.includes(searchTerm) ||
          date_effet?.includes(searchTerm) ||
          derniere_utilisation?.includes(searchTerm) ||
          solde?.includes(searchTerm)
        );
      });
    },

    updateValue() {
      if (this.dotationPonctuelleClt.file) {
        this.dotationPonctuelleClt.data = this.dotationPonctuelleClt.file.map(element => parseInt(element.montant));
        this.dotationPonctuelleClt.data.forEach(s => {
          this.somme += s
        });
          console.log('res',  this.somme);
      }
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllDotPonctuelleClt();
  },


  created() {
    document.title =
      "Dotations ponctuelles clientes | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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
    
    newDotation(type, nom) {
      this.getAllBeneficiaire();
      this.getAllServices();
     if (type === 'nouveau') {
       this.newOrderModal = true
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
     } else if (type === 'airtime') {
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
       this.toggleView();
     } else {
       console.log('type is :', type)
       this.title = nom;
       this.vue = type
     }
    },

    toggleView() {
        this.viewListDotPonctuelleClt = !this.viewListDotPonctuelleClt;
        this.viewListVerification = !this.viewListVerification;
        this.listDotAirtimeFile = [];
        this.somme = "";
     },


    closeModal() {
      this.newOrderModal = false;
      this.selectedService = "";
      this.selectedRecipient = "";
      this.listDotAirtimeFile = [];
      this.somme = "";
    },

    fileToJson(e) {
      const file = e.target.files ? e.target.files[0] : null;
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        /* Get first worksheet */
        const wsname = wb.SheetNames;
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { header:0 } );
        /* Update state */
        this.data = data;
        console.log('data is',data);
        this.dotationPonctuelleClt.file = data;
        const header = data;
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    verifier() {
      this.isLoading = true;
      const data = {
        masse: this.dotationPonctuelleClt.file,
        montant: this.somme,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}dotation/verifieDotationAirtimeFile`, data)
        .then((response) => {
          console.log("verifier is :", response);
          this.listDotAirtimeFile = [...response.data.list]
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

    getAllServices() {
      axios
        .get(
          `${Config.BASE_URL}services/getAllTypesServices`
        )
        .then((response) => {
          this.listService = [...response.data];
          console.log(this.listService);
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
          this.listRecipient = [...response.data];
          console.log(this.listRecipient);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    dotationPClt() {
      this.isLoading = true;
      const data = {
        typeservice: this.selectedService,
        client: this.selectedRecipient,
        ...(this.selectedService == "1"
          ? { volume: this.dotationPonctuelleClt.montant }
          : {}),
        ...(this.selectedService == "2"
          ? { montant: this.dotationPonctuelleClt.montant, }
          : {}),
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}dotation/create_dotation_ponctuelle_client`, data)
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
            this.getAllDotPonctuelleClt();
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

    getAllDotPonctuelleClt() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllDotationPonctuelleClient/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          console.log('response is',response)
          this.listDotationPonctuelleClt = [...response.data.data];
          this.solde.solde = response.data.solde_compte;
          this.solde.airtime = response.data.solde_airtime;
          this.solde.data = response.data.solde_data;
          this.solde.sms = response.data.solde_sms;
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
      this.getAllDotPonctuelleClt();
    },

    exportExcel() {
      saveExcel({
        data: this.listDotationPonctuelleClt,
        fileName: "Dotations_ponctuelles_clientes",
        columns: [
          { field: "create_time", title: "Date création" },
          { field: "beneficiaire", title: "Bénéficiaire" },
          { field: "email", title: "Email" },
          { field: "service", title: "Service" },
          { field: "valeur", title: "Valeur" },
          { field: "date_effet", title: "Date effet" },
          { field: "derniere_utilisation", title: "Dernière utilisation" },
          { field: "solde", title: "Solde" },
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
