<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Mes bénéficiaires</h2>
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
      <button
        v-on:click="newBeneficiaire('new', 'Formulaire Bénéficiare', '')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllBeneficiaire" class="btn btn-light shadow-md mr-2">
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
            <th>NUMÉRO</th>
            <th>NOM & PRÉNOM</th>
            <th>EMAIL</th>
            <th>FLOTTE</th>
            <th>CRÉE LE</th>
            <th>MODIFIÉ LE</th>
            <th>ACTIVATION</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listBeneficiaire.length" >
             <td colspan="9">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(beneficiaire, beneficiaireKey) in filteredListBeneficiaire"
            :key="beneficiaireKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="beneficiaire">{{ beneficiaire.numero }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="beneficiaire"
                >{{ beneficiaire.nom }} {{ beneficiaire.prenom }}</span
              >
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="beneficiaire">{{ beneficiaire.email }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="beneficiaire">{{ beneficiaire.operateur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="beneficiaire">{{ beneficiaire.create_time }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="beneficiaire">{{ beneficiaire.update_time }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <button
                type="button"
                class="rounded-lg text-white text-sm px-5 py-2.5 mr-2"
                :class="[beneficiaire.statut == '0' ? 'bg-green-600 :bg-green-600' : 'bg-gray-600 dark:bg-gray-800']"
                @click="statut(beneficiaire)"
                >{{beneficiaire.statut == '1' ? 'Désactiver' : 'Activer'}}</button>
            </td>
            <td class="w-40 border border-slate-300">
              <button
                class="btn btn-primary shadow-md mr-2"
                @click="
                  newBeneficiaire(
                    'edit',
                    'Modification bénéficiaire',
                    beneficiaire
                  )
                "
              >
                <i class="fas fa-edit"></i>
              </button>
               <button
                class="btn btn-danger shadow-md"
                @click="deleteBeneficiaire(beneficiaire)"
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
  </div>
  <!-- BEGIN: New Order Modal -->
  <Modal :show="newOrderModal" @hidden="newOrderModal = false">
    <ModalHeader>
      <b class="text-2xl">Formulaire Bénéficiare</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Flotte <span class="text-danger">*</span></label
        >
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
          <option v-for="(wallet, walletKey) in listWallet"
            :key="walletKey" :value="wallet.id">
            {{ wallet.operateur }} ({{ wallet.telephone }})
          </option>
        </TomSelect>
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Nom <span class="text-danger">*</span></label
        >
        <input
          v-model="nouveauBeneficiaire.nom"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le nom"
        />
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Prénom <span class="text-danger">*</span></label
        >
        <input
          v-model="nouveauBeneficiaire.prenom"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le prénom"
        />
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Email <span class="text-danger">*</span></label
        >
        <input
          v-model="nouveauBeneficiaire.email"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez l'email"
        />
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Numéro <span class="text-danger">*</span></label
        >
        <input
          type="text"
          class="form-control"
          :disabled="vue === 'edit'"
          v-model="nouveauBeneficiaire.numero"
          v-mask="'## ## ## ## ##'"
          placeholder="Ex: 07 08 45 74 14"
        />
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
      <button
        type="button"
        @click="vue === 'new' ? creerBeneficiaire()
        : vue === 'edit' ? updateBeneficiaire() : ''"
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
      selectedFlotte: "",
      listBeneficiaire: [],
      beneficiaireData: [],
      nouveauBeneficiaire: {
        nom: null,
        prenom: null,
        email: null,
        numero: null,
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
    myModel() {
      if (this.vue === "new") return this.selectedFlotte;
      else return this.selectedFlotte;
    },

    filteredListBeneficiaire() {
      return this.listBeneficiaire?.filter((row) => {
        const telephone = row.create_time?.toLowerCase();
        const nom = row.nom?.toLowerCase();
        const email = row.email?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const create_time = row.create_time?.toLowerCase();
        const update_time = row.update_time?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          telephone.includes(searchTerm) ||
          nom.includes(searchTerm) ||
          email.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          create_time.includes(searchTerm) ||
          update_time.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllBeneficiaire();
  },

  created() {
    document.title =
      "Beneficiaire | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newBeneficiaire(type, name, data) {
      console.log("data is :", data);
      if (type === "new") {
        this.newOrderModal = true;
        console.log("type is :", type);
        console.log("wallet is :", this.listWallet);
        this.vue = type;
        this.title = name;
      } else {
        console.log("type is :", type);
        this.newOrderModal = true;
        this.title = name;
        this.vue = type;
        this.beneficiaireData = data;
        console.log("benificiaire data is :", this.beneficiaireData);
        this.nouveauBeneficiaire = {
          nom : data.nom,
          prenom : data.prenom,
          email : data.email,
          numero : data.numero,
        }
        this.listWallet = [];
        this.listWallet.push({'operateur': data.operateur, 'telephone': data.telephone, })
        console.log("dd is :", this.listWallet);
      }
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedFlotte = "";
      this.nouveauBeneficiaire = {};
      this.listWallet = [];
      this.getAllWallet();
    },

    creerBeneficiaire() {
      this.isLoading = true;
      const data = {
        nom: this.nouveauBeneficiaire.nom,
        prenom: this.nouveauBeneficiaire.prenom,
        email: this.nouveauBeneficiaire.email,
        numero: this.nouveauBeneficiaire.numero,
        portefeuille: this.selectedFlotte,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/createBeneficiaire`, data)
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
            this.getAllBeneficiaire();
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

    getAllWallet() {
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllportefeuilleByClient/${this.user.id}`
        )
        .then((response) => {
          console.log("portefeuille is :", response);
          this.listWallet = [...response.data];
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllBeneficiaire() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllBeneficiaireByClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listBeneficiaire = [...response.data.data];
          this.totalPages = response.data.last_page;
          this.totalRecords = response.data.total;
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

     updateBeneficiaire() {
      this.isLoading = true;
      const data = {
        nom: this.nouveauBeneficiaire.nom,
        prenom: this.nouveauBeneficiaire.prenom,
        email: this.nouveauBeneficiaire.email,
        id: this.beneficiaireData.id,
        user_id: this.user.id,
      };
      axios
        .put(`${Config.BASE_URL}portefeuille/updateBeneficiaire`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.closeModal()
            this.getAllBeneficiaire();
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

    deleteBeneficiaire(datas) {
      console.log("datas is :", datas);
      this.isLoading = true;
      const data = {
        id: datas.id,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/deleteBeneficiaire`, data)
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
            this.getAllBeneficiaire();
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
        portefeuille: datas.idport,
        user_id: this.user.id,
      };
      let url;
      if (datas.statut == '0') {
        url = "portefeuille/activerBeneficiaire";
      } else {
        url = "portefeuille/desactiverBeneficiaire";
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
            this.getAllBeneficiaire();
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
      this.getAllBeneficiaire();
    },

    exportExcel() {
      saveExcel({
        data: this.listBeneficiaire,
        fileName: "Mes_Beneficiaire",
        columns: [
          { field: "telephone", title: "Numéro" },
          { field: "nom", title: "Nom & prénom" },
          { field: "email", title: "Email" },
          { field: "operateur", title: "Flotte" },
          { field: "gain", title: "Gain" },
          { field: "update_time", title: "Modifier le" },
          { field: "statut", title: "Activation" },
        ],
      });
    },
  },
};
</script>

