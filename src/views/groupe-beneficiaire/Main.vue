<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8"  v-if="viewListGroupe">
    <h2 class="text-2xl font-bold font-medium mr-auto">Groupe de contacts</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5"  v-if="viewListGroupe">
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
      <button
        v-on:click="newGroupe('new', 'Ajout groupe simple')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <!-- <button
        v-on:click="newGroupe('massegroupe', 'Ajout groupe en masse')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-file-excel"></i>&nbsp; Excel
      </button> -->
      <button @click="getAllGroupe" class="btn btn-light shadow-md mr-2">
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
            <th>NOM DU GROUPE </th>
            <th>DESCRIPTION</th>
            <th>DATE CRÉATION</th>
            <th>DATE DE MODIFICATION</th>
            <th>MEMBRES</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listGroupe.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(groupe, groupeKey) in filteredListGroupe"
            :key="groupeKey"
            class=""
          >
            <td
              v-html="highlightMatches(groupe.nom )"
              class="w-40 border border-slate-300"></td>
            <td
              v-html="highlightMatches(groupe.description)"
              class="w-40 border border-slate-300"></td>
           <td
              v-html="highlightMatches(groupe.created_at)"
              class="w-40 border border-slate-300"></td>
              <td class="w-40 border border-slate-300">
              <span v-if="groupe">{{ groupe.updated_at }}</span>
            </td>
            <td class="w-60 border border-slate-300">
              <b class="mr-2">( {{groupe.contacts.length}} ) membres</b>
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="
                  newGroupe(
                    'simple', 'Ajout simple membre au groupe', groupe
                  )
                "
              >
                <i class="fas fa-add"></i>
              </button>
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="
                  newGroupe(
                    'masse', 'Ajout en masse membre au groupe', groupe
                  )
                "
              >
              <i class="fas fa-folder-plus"></i>
              </button>
              <button
                class="btn btn-primary shadow-md"
                @click="
                  newGroupe(
                    'voir',
                    'Liste contacts', groupe
                  )
                "
              >
                <i class="fas fa-eye"></i>
              </button>
            </td>
            <td class="w-40 border border-slate-300">
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="
                  newGroupe(
                    'edit',
                    'Modification groupe',
                    groupe
                  )
                "
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-danger shadow-md"
                @click="supprimerGroupe(groupe)"
              >
                <i class="fas fa-trash"></i>
              </button>
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
    <!-- BEGIN: Liste bénéficiaire -->
  </div>
  <div class="flex items-center mt-8" v-if="viewListMembre">
    <div class="text-right">
      <button
        @click="toggleView"
        type="button"
        class="btn btn-danger w-24 mr-1"
      >
        Fermer
      </button>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListMembre">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
        <h2 class="text-2xl font-medium mr-auto">
          <b>{{title}} : {{membreData.nom}}</b>
        </h2>
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
            <th>NOM DU GROUPE </th>
            <th>DESCRIPTION</th>
            <th>SUPPRIMER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!membreData.contacts.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(membre, membreKey) in membreData.contacts"
            :key="membreKey"
            class=""
          >
            <td class="w-60 border border-slate-300">
              <span v-if="membre"
                >{{ membre.nom }} {{ membre.prenoms }} </span
              >
            </td>
            <td class="w-60 border border-slate-300">
              <span v-if="membre">{{ membre.numero }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <button
                class="btn btn-danger shadow-md mr-2"
                @click="supprimerMembre(membre)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- END: Data List -->
    <!-- BEGIN: Pagination -->
     <!-- <button 
     :disabled="pageNumber === 0" 
      click="prevPage"><i class="fa fa-arrow-left"></i>Prev</button>
      <button 
       :disabled="pageNumber >= pageCount -1" 
        @click="nextPage">Next<i class="fa fa-arrow-right"></i> 
       </button> -->
    <!-- END: Pagination -->
  </div>
  <!-- BEGIN: New Order Modal -->
  <Modal :show="newOrderModal" @hidden="newOrderModal = false">
    <ModalHeader>
      <b class="text-2xl">{{title}}</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div class="col-span-12"
       v-if="vue === 'simple'">
        <label for="contact" class="form-label">
          <b>Contact <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedContactNoGroup"
          :options="{
            placeholder: 'Selectionner le contact',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Liste de contact',
              },
            },
          }"
          class="w-full"
          multiple
        >
          <option></option>
          <option v-for="(contact, contactKey) in listContactNoGroup"
            :key="contactKey" :value="contact.id"
          >
            {{ contact.nom }} {{ contact.prenoms }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="vue === 'masse'"
        class="col-span-12 sm:col-span-12"
      >
        <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
          <a href="/model/model_ajoutmembres_groupe.xlsx">
            <button class="btn btn-dark shadow-md mr-2">
                <i class="fa fa-download"></i>&nbsp; Télécharger le modèle
            </button>
          </a>
        </div>
        <div>
          <input
            type="file"
            @change="fileToJson"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </div>
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Nom du groupe <span class="text-danger">*</span></label
        >
        <input
          v-model="nouveauGroupe.nom"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le nom"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="description" class="form-label">
          <b>Description <span class="text-danger">*</span></b>
        </label>
        <textarea
          class="w-full form-control shadow-inner border-2"
          placeholder="Entrez la description.."
          rows="4"
          name="description"
          v-model="nouveauGroupe.description"
        >
        </textarea>
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
        @click="vue === 'new' ? creerGroupe() 
        : vue === 'edit' ? updateGroupe()
        : vue === 'simple' || vue === 'masse' ? ajouterMembre() : ''"
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
      size: {
          type: null,
          required: false,
          default: 10
      },
      pageNumber: 0,
      newOrderModal: ref(false),
      addItemModal: ref(false),
      title: "",
      vue: "",
      somme: 0,
      viewListGroupe: true,
      viewListMembre: false,
      selectedContactNoGroup: "",
      beneficiaireAll: [],
      listContactNoGroup: [],
      listGroupe: [],
      groupeData: [],
      membreData: [],
      nouveauGroupe: {
        nom: null,
        description: null,
        file : null,
        data : [],
      },
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

    pageCount() {
            let l = this.membreData.length,
                s = this.size;
            return Math.ceil(l / s);
    },
    paginatedData() {
        const start = this.pageNumber * this.size,
            end = start + this.size;
        return this.membreData.slice(start, end);
    },
    
   updateValue() {
      if (this.nouveauGroupe.file) {
        this.nouveauGroupe.data = this.nouveauGroupe.file.map(element => parseInt(element.montant));
        this.nouveauGroupe.data.forEach(s => {
          this.somme += s
        });
          console.log('res',  this.somme);
      }
    },

    filteredListGroupe() {
      return this.listGroupe?.filter((row) => {
        const nom = row.nom?.toLowerCase();
        const description = row.description?.toLowerCase();
        const created_at = row.created_at?.toLowerCase();
        const updated_at = row?.updated_at?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          nom.includes(searchTerm) ||
          description.includes(searchTerm) ||
          created_at.includes(searchTerm) ||
          updated_at.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllGroupe();
  },

  created() {
    document.title =
      "Groupe de bénéficiaire | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    
    nextPage() {
            this.pageNumber++;
        },
        prevPage() {
            this.pageNumber--;
        },

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
      this.newOrderModal = false;
      this.selectedContactNoGroup = "";
      this.nouveauGroupe = {};
    },

    toggleView() {
        this.viewListGroupe = !this.viewListGroupe;
        this.viewListMembre = !this.viewListMembre;
     },

    newGroupe(type, name, data) {
      console.log("data is :", data);
      if (type === "new") {
        this.newOrderModal = true;
        console.log("type is :", type);
        this.vue = type;
        this.title = name;
      } else if (type === "massegroupe") {
        this.newOrderModal = true;
        console.log("type is :", type);
        this.vue = type;
        this.title = name;
      } else if (type === "simple") {
        this.newOrderModal = true;
        this.getContactNoGroupe();
        this.groupeData = data;
        console.log("groupeData is :", this.groupeData);
        console.log("type is :", type);
        this.vue = type;
        this.title = name;
      } else if (type === "masse") {
        this.newOrderModal = true;
        this.groupeData = data;
        console.log("groupeData is :", this.groupeData);
        console.log("type is :", type);
        this.vue = type;
        this.title = name;
      } else if (type === "edit") {
        console.log("type is :", type);
        this.newOrderModal = true;
        this.title = name;
        this.vue = type;
        this.membreData = data;
        this.nouveauGroupe = {
          nom : data.nom,
          description : data.description,
        }
        console.log("membreData :", data);
      } else {
        this.title = name;
        this.vue = type;
        this.membreData = data;
        this.toggleView()
      }
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
        this.nouveauGroupe.file = data;
        const header = data;
        // this.nouveauGroupe.file.forEach(element => {
        // this.listData.push({"nom": element.NOM,"numero": element.NUMERO})
        // });
        // console.log(this.listData);
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },


    creerGroupe() {
      this.isLoading = true;
      const data = {
        nom :this.nouveauGroupe.nom,
        description: this.nouveauGroupe.description,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}contact/create_groupe`, data)
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
            this.getAllGroupe();
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

    getAllGroupe() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}contact/getAllGroupeContact`
        )
        .then((response) => {
          this.isLoading = false;
          console.log("benef is :", response);
          this.listGroupe = [...response.data];
        })
        .catch((error) => {
          console.log(error);
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getContactNoGroupe() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}contact/getContactNoGroupe/${this.user.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listContactNoGroup = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

     updateGroupe() {
      this.isLoading = true;
      const data = {
        id : this.membreData.id,
        nom : this.nouveauGroupe.nom,
        description: this.nouveauGroupe.description,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}contact/update_groupe`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.getAllGroupe();
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

    supprimerGroupe(datas) {
      console.log("datas is :", datas);
      this.isLoading = true;
      const data = {
        id: datas.id,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}contact/delete_groupe`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.active != this.active;
            this.getAllGroupe();
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

    ajouterMembre() {
      this.isLoading = true;
      const data = {
        groupe_id: this.groupeData.id,
        user_id: this.user.id,
        ...(this.vue === "simple"
        ? {liste_contact : this.selectedContactNoGroup,}
        : {}),
        ...(this.vue === "masse"
        ? { liste_contact: this.nouveauGroupe.file }
        : {}),
      };
       let url;
      if (this.vue === "simple") {
        url = "contact/add_member_groupe";
      } else if (this.vue === "masse") {
        url = "contact/add_member_masse_groupe";
      } 
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
            this.getAllGroupe();
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

    supprimerMembre(datas) {
      console.log("datas is :", datas);
      this.isLoading = true;
      const data = {
        groupe_id: this.membreData.id,
        contact_id : datas.id,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}contact/delete_member_groupe`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.active != this.active;
            this.getAllGroupe();
            this.toggleView();
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
      this.getAllGroupe();
    },

    exportExcel() {
      saveExcel({
        data: this.listGroupe,
        fileName: "Groupe_Beneficiaire",
        columns: [
          { field: "nom", title: "Nom du groupe" },
          { field: "description", title: "Description" },
          { field: "created_at", title: "Date création" },
          { field: "updated_at", title: "Date modification" },
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
