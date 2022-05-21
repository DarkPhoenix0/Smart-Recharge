<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8" v-if="viewListUser">
    <h2 class="text-2xl font-bold font-medium mr-auto">
      Gestion des utilisateurs
    </h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListUser">
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
        v-on:click="newUser('new', 'Création utilisateur', '')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-user-plus"></i>&nbsp; Nouveau
      </button>
      <button
        v-on:click="newUser('masse', 'Création utilisateurs en masse', '')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-users"></i>&nbsp; Création en masse
      </button>
      <button @click="getAllUsers" class="btn btn-light shadow-md mr-2">
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
            <th>NOM & PRENOM</th>
            <th>EMAIL</th>
            <th>PROFIL</th>
            <th>CRÉE LE</th>
            <th>REINIT. PASS.</th>
            <th>ACTION</th>
            <th>ACTIVATION</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listUsers.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(user, userKey) in filteredlistUsers"
            :key="userKey"
            class=""
          >
            <td
              v-html="highlightMatches(user?.nom)"
              class="w-60 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(user?.email)"
              class="w-40 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(user?.profil)"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(user?.date_creation)"
              class="w-60 border border-slate-300"
            ></td>
            <td class="w-40 border border-slate-300">
              <button class="btn btn-primary" @click="reinitialiser(user)">
                <i class="fas fa-refresh"></i>
              </button>
            </td>
            <td class="w-20 border border-slate-300">
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="newUser('edit', 'Modification utilisateur', user)"
              >
                <i class="fas fa-edit"></i>
              </button>
            </td>
            <td class="w-20 border border-slate-300">
              <button
                type="button"
                class="rounded-lg text-white text-sm px-5 py-2.5 mr-2"
                :class="[user.etat == '0' ? 'bg-green-600 :bg-green-600' : 'bg-gray-600 dark:bg-gray-800']"
                @click="statut(user)"
                >{{user.etat == '1' ? 'Désactiver' : 'Activer'}}</button>
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
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListVerification">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <div v-if="vue === 'masse' "
        class="col-span-12 sm:col-span-12"
      >
          <a href="/model/model_user_multiple.xlsx">
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
    <div class="col-span-12">
      <table class="table border-collapse border border-slate-400">
        <thead>
          <tr>
            <th>NOM </th>
            <th>PRÉNOM </th>
            <th>EMAIL</th>
            <th>CONTACT</th>
            <th>LOCALISATION</th>
            <th>PROFIL</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listUserMasse.length">Aucune donnée disponible</div>
          </tr>
          <tr
             v-for="(masse, masseKey) in filteredListUserMasse"
            :key="masseKey"
            class=""
          >
            <td v-html="highlightMatches(masse?.nom)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(masse?.prenom)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(masse?.email)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(masse?.contact)" class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(masse?.localisation)" class="w-20 border border-slate-300" 
                ></td>
            <td class="w-60 border border-slate-300" 
                >
                 <div class="col-span-12">
                    <TomSelect
                      v-model="selectedProfil"
                      :options="{
                        closeAfterSelect: false,
                        plugins: {
                          dropdown_header: {
                            title: 'Profil',
                          },
                        },
                      }"
                      class="w-full"
                    >
                      <option
                        v-for="(profil, profilKey) in listProfil"
                        :key="profilKey"
                        :value="profil.id"
                      >
                        {{ profil.libelle }}
                      </option>
                    </TomSelect>
                  </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-10">
        <button @click="creerUserMasse" class="btn btn-primary shadow-md ml-2">
            Enregistrer
        </button>
        <button @click="toggleView" class="btn btn-danger shadow-md ml-2">
          <i class="fas fa-undo"></i>&nbsp; Fermer
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
      <b class="text-2xl text-center justify-content-center">{{ title }}</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div v-if="vue === 'masse'" class="col-span-12 sm:col-span-12">
        <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
          <button v-on:click="charger" class="btn btn-success shadow-md mr-2">
            <i class="fas fa-upload"></i>&nbsp; Charger
          </button>
          <button v-on:click="Export" class="btn btn-dark shadow-md mr-2">
            <i class="fa fa-download"></i>&nbsp; Télécharger le modèle
          </button>
        </div>
        <input
          id="fileupload"
          type="file"
          class="form-control"
          name="fileupload"
          v-on:change="uploadFile"
          ref="fileInput"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="nom" class="form-label">
          <b>Nom <span class="text-danger">*</span></b>
        </label>
        <input
          id="pos-form-3"
          v-model="createUser.nom"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le nom"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="prenom" class="form-label">
          <b>Prénom <span class="text-danger">*</span></b>
        </label>
        <input
          id="pos-form-3"
          v-model="createUser.prenom"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le prénom"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="email" class="form-label">
          <b>Email <span class="text-danger">*</span></b>
        </label>
        <input
          id="pos-form-3"
          v-model="createUser.email"
          type="email"
          class="form-control flex-1"
          placeholder="Entrez l'email"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="numero" class="form-label">
          <b>Profil <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedProfil"
          :options="{
            placeholder: 'Selectionner le profil',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Profil',
              },
            },
          }"
          class="w-full"
        >
          <!-- <option></option> -->
          <option
            v-for="(profil, profilKey) in listProfil"
            :key="profilKey"
            :value="profil.id"
          >
            {{ profil.libelle }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="vue === 'new' || vue === 'edit'"
        class="col-span-12 sm:col-span-12"
      >
        <label for="numero" class="form-label">
          <b>Contact <span class="text-danger">*</span></b>
        </label>
        <input
          type="text"
          class="form-control"
          v-model="createUser.contact"
          v-mask="'## ## ## ## ##'"
          placeholder="Entrez le contact"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="location" class="form-label">
          <b>Localisation <span class="text-danger">*</span></b>
        </label>
        <input
          class="w-full form-control"
          v-model="createUser.localisation"
          type="text"
          placeholder="Entrez la localisation.."
          name="localisation"
        />
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
      <button
        type="button"
        @click="vue === 'edit' ? updateUser() : creerUtilisateur()"
        class="btn btn-primary w-32"
      >
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
      dd: {},
      createUser: {
        nom: null,
        prenom: null,
        email: null,
        contact: null,
        localisation: null,
        profil: null,
        data: [],
        file: null
      },
      viewListUser: true,
      viewListVerification: false,
      selectedProfil: {},
      listProfil: [],
      listUserMasse: [],
      listUsers: [],
      userData: [],
      solde: { airtime: "" },
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

    updateValue() {
      if (this.createUser.file) {
        this.createUser.data = this.createUser.file.map(element => parseInt(element.montant));
        this.createUser.data.forEach(s => {
          this.somme += s
        });
          console.log('res',  this.somme);
      }
    },

    filteredListUserMasse() {
      return this.listUserMasse?.filter((row) => {
        const nom = row.nom?.toLowerCase();
        const prenom = row.prenom?.toLowerCase();
        const email = row.email?.toLowerCase();
        const contact = row.contact?.toLowerCase();
        const localisation = row.localisation?.toLowerCase();
        const searchTerm = this.search?.toLowerCase();

        return (
          nom?.includes(searchTerm) ||
          prenom?.includes(searchTerm) ||
          email?.includes(searchTerm) ||
          contact?.includes(searchTerm) ||
          localisation?.includes(searchTerm)
        );
      });
    },

    filteredlistUsers() {
      return this.listUsers?.filter((row) => {
        const nom = row.nom?.toLowerCase();
        const email = row.email?.toLowerCase();
        const profil = row.profil?.toLowerCase();
        const date_creation = row.date_creation?.toLowerCase();
        const searchTerm = this.search?.toLowerCase();

        return (
          nom?.includes(searchTerm) ||
          email?.includes(searchTerm) ||
          profil?.includes(searchTerm) ||
          date_creation?.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllUsers();
  },

  created() {
    document.title =
      "Gestion des utilisateurs | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newUser(type, nom, data) {
      if (type === "new") {
        this.getAllProfil();
        this.newOrderModal = true;
        console.log("type is :", type);
        this.vue = type;
        this.title = nom;
      } else if (type === "masse") {
        this.toggleView();
        this.getAllProfil();
        console.log("type is :", type);
        this.vue = type;
        this.title = nom;
      } else {
        console.log("type is :", data);
        this.newOrderModal = true;
        this.title = nom;
        this.vue = type;
        this.userData = data;
        this.createUser = {
          telephone : data.telephone,
          nom : data.nom,
          prenom : data.prenom,
          contact : data.contact,
          localisation : data.localisation,
          email : data.email,
          profil : data.profil
        },
        this.listProfil = [];
        this.listProfil.push({'libelle': data.profil,})
        console.log("dd is :", this.dd);
      }
    },

    toggleView() {
        this.viewListUser = !this.viewListUser;
        this.viewListVerification = !this.viewListVerification;
        this.listUserMasse = [];
     },

    closeModal() {
      this.newOrderModal = false;
      this.selectedProfil = "";
      this.createUser = {};
    },

    getAllProfil() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}login/getAllProfil`)
        .then((response) => {
          this.isLoading = false;
          console.log("profil is :", response);
          this.listProfil = [...response.data];
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
        .get(`${Config.BASE_URL}login/getAllUserStart/${this.page}`)
        .then((response) => {
          this.isLoading = false;
          console.log("portefeuille is :", response);
          this.listUsers = [...response.data.data];
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

    reinitialiser(toResetData) {
      this.isLoading = true;
      const data = {
        email: toResetData.email,
        id: toResetData.id,
      };
      axios
        .put(`${Config.BASE_URL}login/reinitialisePassWord`, data)
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
            this.getAllUsers();
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
    
    creerUtilisateur() {
      this.isLoading = true;
      const data = {
        nom: this.createUser.nom,
        prenom: this.createUser.prenom,
        email: this.createUser.email,
        contact: this.createUser.contact,
        localisation: this.createUser.localisation,
        id_profil: this.selectedProfil,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}login/register_user`, data)
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
            this.getAllUsers();
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

    creerUserMasse() {
      this.isLoading = true;
      const data = {
        list_user: this.listUserMasse,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}login/register_multi_user`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.toggleView();
            this.getAllUsers();
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

    updateUser() {
      this.isLoading = true;
      const data = {
        nom: this.createUser.nom,
        prenom: this.createUser.prenom,
        email: this.createUser.email,
        contact: this.createUser.contact,
        localisation: this.createUser.localisation,
        id_profil: this.userData.id_profil,
        user_id: this.user.id,
      };
      axios
        .put(`${Config.BASE_URL}login/UpdateUser`, data)
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
            this.getAllUsers();
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
        url = "login/ActiverUser";
      } else {
        url = "login/desactiverUser";
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
            this.getAllUsers();
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
        this.createUser.file = data;
        const header = data;
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    charger() {
          this.listUserMasse = this.createUser.file;
    },

    onPageChange(page) {
      this.page = page;
      this.getAllUsers();
    },

    exportExcel() {
      saveExcel({
        data: this.listUsers,
        fileName: "Gestion_utilisateur",
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
