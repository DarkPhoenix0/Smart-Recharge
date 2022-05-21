<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8" v-if="viewListFlotte">
    <h2 class="text-2xl font-bold font-medium mr-auto">Gestion des flottes</h2>
        <div class="text-right font-bold text-2xl">
              Solde <u>{{ solde.solde }}</u> FCFA
        </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListFlotte">
    <div
      class="
        col-span-12
        flex flex-wrap
        sm:flex-nowrap
        items-center
        mt-2
      "
    >
      <button
        v-on:click="newFlotte('new','Formulaire Flotte','')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-user-plus"></i>&nbsp; Nouveau
      </button>
      <button
        v-on:click="newFlotte('masse','Création Flotte en masse','')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-users"></i>&nbsp; Création en masse
      </button>
      <button @click="getAllportefeuille" class="btn btn-light shadow-md mr-2">
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
            <th>NOM</th>
            <th>PRÉNOM</th>
            <th>EMAIL</th>
            <th>OPÉRATEUR</th>
            <th>TÉLÉPHONE</th>
            <th>SOLDE</th>
            <th>DATE CRÉATION</th>
            <th>MODIFIER</th>
            <th>ACTIVATION</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listFlotte.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(flotte, flotteKey) in filteredListFlotte"
            :key="flotteKey"
            class=""
          >
            <td
              v-html="highlightMatches(flotte?.nom)"
              class="w-40 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(flotte?.prenom)"
              class="w-60 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(flotte?.email)"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(flotte?.operateur)"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(flotte?.telephone)"
              class="w-40 border border-slate-300"
            ></td>
            <td
              
              class="w-20 border border-slate-300"
            ><span>{{flotte?.solde}}</span></td>
            <td
              v-html="highlightMatches(flotte?.date_creation)"
              class="w-60 border border-slate-300"
            ></td>
            <td class="w-20 border border-slate-300">
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="newFlotte('edit', 'Modification formulaire flotte', flotte)"
              >
                <i class="fas fa-edit"></i>
              </button>
            </td>
            <td class="w-20 border border-slate-300">
              <button
                type="button"
                class="rounded-lg text-white text-sm px-5 py-2.5 mr-2"
                :class="[flotte.etat == '0' ? 'bg-green-600 :bg-green-600' : 'bg-gray-600 dark:bg-gray-800']"
                @click="statut(flotte)"
                >{{flotte.etat == '1' ? 'Désactiver' : 'Activer'}}</button>
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
  <div class="flex items-center mt-8" v-if="viewListVerification">
    <h2 class="text-2xl font-bold font-medium mr-auto">{{title}}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListVerification">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <div v-if="vue === 'masse' "
        class="col-span-12 sm:col-span-12"
      >
          <a href="/model/model_portefeuille_multiple.xlsx">
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
          <button v-on:click="charger"
          class="btn btn-primary shadow-md">
          <i class="fas fa-refresh"></i>&nbsp; Charger
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
            <th>EMAIL</th>
            <th>NUMÉRO</th>
            <th>SOLDE</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listFlotteMasse.length">Aucune donnée disponible</div>
          </tr>
          <tr
             v-for="(masse, masseKey) in listFlotteMasse"
            :key="masseKey"
            class=""
          >
            <td class="w-60 border border-slate-300" 
                >
                <span v-if="masse">{{ masse.email }}</span>
                </td>
            <td class="w-60 border border-slate-300" 
                >
                <span v-if="masse">{{ masse.numero }}</span>
                </td>
            <td class="w-60 border border-slate-300" 
                >
                <span v-if="masse">{{ masse.solde }}</span>
                </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-10">
        <button @click="creerFlotteMasse" class="btn btn-primary shadow-md ml-2">
            Enregistrer
        </button>
        <button @click="toggleView" class="btn btn-danger shadow-md ml-2">
          <i class="fas fa-undo"></i>&nbsp; Fermer
        </button>
      </div>
    </div>
    <!-- END: Data List -->
    <!-- BEGIN: Pagination -->
    <!-- <div class="col-span-12 text-right">
      <Pagination
        :total-pages="totalPages"
        :per-page="recordsPerPage"
        :current-page="page"
        @pagechanged="onPageChange"
      />
    </div> -->
    <!-- END: Pagination -->
  </div>
<!-- BEGIN: Rapport -->
  <div class="flex items-center mt-8" v-if="viewListRapport">
    <h2 class="text-2xl font-medium mr-auto">
      <b>Tableau de rapports</b>
    </h2>
    <div class="text-right">
      <button
        @click="toggleViewRapport"
        type="button"
        class="btn btn-danger w-24 mr-1"
      >
        Fermer
      </button>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListRapport">
    <!-- BEGIN: Data List -->
    <div class="col-span-12 overflow-auto lg:overflow-visible">
      <table class="table border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>ETAT</th>
            <th>MESSAGE</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(rapport, rapportKey) in listRapport"
            :key="rapportKey"
          >
            <td 
              class="w-15 border-slate-300">
              <span v-if="rapport">{{ rapport.ok }}</span>
              </td>
            <td 
            class="w-15 border-slate-300">
              <span v-if="rapport">{{ rapport?.message }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- END: Data List -->
  </div>
<!-- BEGIN: New Order Modal -->
  <Modal :show="newOrderModal" @hidden="newOrderModal = false">
    <ModalHeader>
     <b class="text-2xl text-center justify-content-center">{{title}}</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div  class="col-span-12">
         <label for="numero" class="form-label">
          <b>Client <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedUser"
          :options="{
            placeholder: 'Selectionner le client',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Client',
              },
            },
          }"
          class="w-full"
        >
          <!-- <option></option> -->
          <option
            v-for="(user, userKey) in listUsers"
            :key="userKey"
            :value="user.id"
          >
            {{ user.nom }} {{ user.prenom }} ({{ user.email }})
          </option>
        </TomSelect>
      </div>
      <div 
        class="col-span-12 sm:col-span-12"
      >
        <label for="numero" class="form-label">
          <b>Téléphone <span class="text-danger">*</span></b>
        </label>
        <input
          type="text"
          class="form-control"
          v-model="this.createFlotte.contact"
          v-mask="'## ## ## ## ##'"
          placeholder="Entrez le numéro"
        />
      </div>
      <div v-if="vue === 'new'"
        class="col-span-12"
      >
        <label for="numero" class="form-label">
          <b>Solde <span class="text-danger">*</span></b>
        </label>
        <number
          name="montant"
          class="form-control"
          placeholder="Ex: 10 000"
          v-model="createFlotte.montant"
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
       @click="vue === 'new' ? creerFlotte() : updateFlotte()" 
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
      newOrderModal: ref(false),
      addItemModal: ref(false),
      title: "",
      vue: "",
      createFlotte: {
        telephone: null,
        solde: null,
        file: null,
        data: [],
      },
      selectedUser: "",
      listUsers: [],
      solde: {'solde': ''},
      viewListFlotte: true,
      viewListVerification: false,
      viewListRapport: false,
      selectedProfil: {},
      listProfil: [
        { id: "0", libelle: "Admin", ischecked: false },
        { id: "1", libelle: "User", ischecked: false },
        { id: "2", libelle: "Gestionnaire", ischecked: false },
      ],
      listFlotteMasse: [],
      listFlotte: [],
      listRapport: [],
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

    // handleValue(){
    //       if (this.vue === 'edit')
    //           return this.createFlotte.contact;
    //       else
    //           return this.createFlotte.solde;
    //   }, 
      
    updateValue() {
      if (this.createFlotte.file) {
        this.createFlotte.data = this.createFlotte.file.map(element => parseInt(element.montant));
        this.createFlotte.data.forEach(s => {
          this.somme += s
        });
          console.log('res',  this.somme);
      }
    },

    filteredListFlotte() {
      return this.listFlotte.filter((row) => {
      const nom = row.nom.toLowerCase();
      const prenom = row.prenom.toLowerCase();
      const email = row.email.toLowerCase();
      const operateur = row.operateur?.toLowerCase();
      const solde = row.solde;
      const date_creation = row.date_creation.toLowerCase();
      const searchTerm = this.search.toLowerCase();

      return (
        nom.includes(searchTerm) ||
        prenom.includes(searchTerm) ||
        email.includes(searchTerm) ||
        operateur.includes(searchTerm) ||
        solde ||
        date_creation.includes(searchTerm)
      );
    });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllportefeuille(); 
    this.getSoldeGlobal(); 
  },

  created() {
    document.title =
      "Gestion des flottes | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newFlotte(type, nom, data) {
      if (type === 'new') {
        this.getAllUsers();
        this.newOrderModal = true
        console.log('new is :', type)
        this.vue = type;
        this.title = nom;
      } else if (type === 'masse') {
        this.toggleView();
        console.log('masse is :', type);
        this.vue = type;
        this.title = nom;
      } else {
        console.log('edit is :', data);
        this.newOrderModal = true;
        this.vue = type;
        this.title = nom;
        this.createFlotte = {
          contact : data.telephone,
        }
        this.flotteData = data;
        this.listUsers.push({'nom': data.nom, 'prenom': data.prenom, 'email': data.email})
        console.log("listUsers is :", this.listUsers);
      }
    },

    toggleView() {
        this.viewListFlotte = !this.viewListFlotte;
        this.viewListVerification = !this.viewListVerification;
        this.listFlotteMasse = [];
     },

     toggleViewRapport() {
      this.viewListFlotte = !this.viewListFlotte;
       this.viewListRapport = !this.viewListRapport;
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedUser = "";
      this.createFlotte = {};
      this.listUsers = [];
    },

    getSoldeGlobal() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}parametres/getSoldeGlobal`)
        .then((response) => {
          this.isLoading = false;
          console.log("solde is :", response);
           this.solde.solde = response.data.valeur;
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
    
    getAllUsers() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}login/getAllUser`)
        .then((response) => {
          this.isLoading = false;
          console.log("user is :", response);
          this.listUsers = [...response.data];
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

    getAllportefeuille() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}portefeuille/getAllportefeuilleStart/${this.page}`)
        .then((response) => {
          this.isLoading = false;
          this.getSoldeGlobal();
          console.log("listFlotte is :", response);
          this.listFlotte = [...response.data.data];
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

    creerFlotte() {
      this.isLoading = true;
      const data = {
        client_id: this.selectedUser,
        solde: this.createFlotte.montant,
        telephone: this.createFlotte.contact,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/createPortefeuille`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          }  else {
            this.getAllportefeuille();
            this.closeModal();
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

    creerFlotteMasse() {
      this.isLoading = true;
      const data = {
        list_user: this.listFlotteMasse,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/createPortefeuilleMasse`, data)
        .then((response) => {
          console.log("creerFlotteMasse is :", response);
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          }  else {
            this.listRapport = [...response.data];
            this.viewListRapport = !this.viewListRapport;
            this.viewListFlotte = this.viewListFlotte;
            this.viewListVerification = !this.viewListVerification;
            console.log("listRapport is :", this.listRapport);
            this.getAllportefeuille();
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

    updateFlotte() {
      this.isLoading = true;
      const data = {
        client_id: this.flotteData.idclient,
        telephone: this.createFlotte.contact,
        user_id: this.user.id,
      };
      axios
        .put(`${Config.BASE_URL}portefeuille/Updateportefeuille`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.newOrderModal = false;
            this.getAllportefeuille();
            this.closeModal();
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

    statut(datas) {
      this.isLoading = true;
      const data = {
        id: datas.id,
        user_id: this.user.id,
      };
      let url;
      if (datas.etat == '0') {
        url = "portefeuille/activer";
      } else {
        url = "portefeuille/desactiver";
      }
      axios
        .post(`${Config.BASE_URL}${url}`, data)
        .then((response) => {
          console.log("button is :", this.active);
          this.isLoading = false;
          if (response.data.error) {
            this.active == false;
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.active != this.active;
            this.getAllportefeuille();
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
        this.createFlotte.file = data;
        const header = data;
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    charger() {
          this.listFlotteMasse = this.createFlotte.file;
          console.log('listFlotteMasse is', this.listFlotteMasse);
    },

    onPageChange(page) {
      this.page = page;
      this.getAllportefeuille();
    },

    exportExcel() {
      saveExcel({
        data: this.listFlotte,
        fileName: "Gestion_Flotte",
        columns: [
         { field: "nom", title: "Nom" },
          { field: "prenom", title: "Prénom" },
          { field: "email", title: "Email" },
          { field: "operateur", title: "Opérateur" },
          { field: "telephone", title: "Téléphone" },
          { field: "solde", title: "Solde" },
          { field: "date_creation", title: "Date création" },
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
