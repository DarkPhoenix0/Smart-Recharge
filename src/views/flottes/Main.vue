<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Mes flottes</h2>
    <div class="text-right font-bold text-2xl">
      Airtime <u>{{ solde.airtime }} FCFA</u> | DATA
      <u>{{ solde.data }} MB</u>
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
      <button
        v-on:click="detailFlotte('transfert', 'Transfert flotte à flotte', '')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-envelope"></i>&nbsp; Transfert flotte à flotte
      </button>
      <button @click="getAllFlottes" class="btn btn-light shadow-md mr-2">
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
            <th>SOLDE AIRTIME (FCFA)</th>
            <th>SOLDE DATA</th>
            <th>OPÉRATEUR</th>
            <th>GAIN (FCFA)</th>
            <th>DATE CRÉATION</th>
            <th>CHARGER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listFlotte.length" >
             <td colspan="7">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(flotte, flotteKey) in listFlotte"
            :key="flotteKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="flotte">{{ flotte.telephone }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="flotte">{{ flotte.solde }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="flotte">{{ flotte.solde_data }} MB</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="flotte">{{ flotte.operateur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="flotte">{{ flotte.gain }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="flotte">{{ flotte.date_creation }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <button
                class="btn btn-dark shadow-md mr-2"
                @click="detailFlotte('charger', 'Chargement flotte', flotte)"
              >
                <i class="fas fa-plus"></i>&nbsp;Charger
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
      <b class="text-2xl" v-if="title === 'Transfert flotte à flotte'">{{ title }}</b>
      <b class="text-2xl"  v-if="title === 'Chargement flotte'">{{ title }} - {{ toEditData.operateur }}</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div v-if="vue === 'charger'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Choix du type de chargement <span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedChargementType"
          :options="{
            placeholder: 'Selectionner le type de chargement',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Type chargement',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option
            v-for="(typecharge, typechargeKey) in listTypeCharge"
            :value="typecharge.libelle"
          >
            {{ typecharge.libelle }}
          </option>
        </TomSelect>
      </div>
      <div v-if="vue === 'charger' && selectedChargementType === 'Collect'"
        class="col-span-12 sm:col-span-12"
      >
        <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
        <input
        id="pos-form-3"
        v-model="chargerWallet.reference"
        type="text"
        class="form-control flex-1 mr-2"
        placeholder="Entrez la réference transaction"
      />
        <button v-on:click="find"
          class="btn btn-dark shadow-md">
          <i class="fa fa-search"></i>&nbsp; Rechercher
        </button>
        </div>
      </div>
      <div
        v-if="
          vue === 'charger' && selectedChargementType === 'Gain'
        "
         class="col-span-12 text-center justify-content-center font-bold text-2xl">
      Gain : {{ toEditData.gain }} FCFA
      </div>
      <div
        v-if="vue === 'charger' && selectedChargementType === 'Dotation'"
        class="col-span-12"
      >
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Service <span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedService"
          :options="{
            placeholder: 'Selectionner le type de service',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Type service',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option
            v-for="(typeservice, typeserviceKey) in listService"
            :value="typeservice.numero"
          >
            {{ typeservice.libelle }}
          </option>
        </TomSelect>
      </div>
      <div v-if="vue === 'transfert'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Flotte créditeur <span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedCrediteur"
          :options="{
            placeholder: 'Selectionner votre béneficiaire',
            closeAfterSelect: true,
            plugins: {
              dropdown_header: {
                title: 'Béneficiaire',
              },
            },
          }"
          class="w-full"
        >
          <option
            v-for="(credit, creditKey) in listWallet"
            :value="credit.numero"
          >
            {{ credit.operateur }} {{ credit.telephone }}
          </option>
        </TomSelect>
      </div>
      <div v-if="vue === 'transfert'" class="col-span-12">
        <label for="pos-form-2" class="text-xs font-bold mb-2"
          >Flotte débiteur <span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedDebiteur"
          :options="{
            placeholder: 'Selectionner votre béneficiaire',
            closeAfterSelect: true,
            plugins: {
              dropdown_header: {
                title: 'Béneficiaire',
              },
            },
          }"
          class="w-full"
        >
          <option
            v-for="(debit, debitKey) in listWallet"
            :value="debit.numero"
          >
            {{ debit.operateur }} {{ debit.telephone }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="
          vue === 'transfert' ||
          vue === 'charger' && (selectedChargementType === 'Gain' || (selectedChargementType === 'Dotation' && (selectedService === 'Data' || selectedService === 'Airtime')) )
        "
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >{{vue === 'charger' && (selectedChargementType === 'Dotation' && selectedService === 'Data') ? label = "Volume Data" 
          : vue === 'charger' && (selectedChargementType === 'Dotation' || selectedChargementType === 'Gain') ? label = "Montant Airtime" 
          : label = "Montant" }} <span class="text-danger">*</span></label
        >
        <number
          name="montant"
          class="form-control"
          placeholder="Ex: 10 000"
          v-model="chargerWallet.montant"
          v-bind="number"
        >
        </number>
      </div>
      <div
        v-if="
          vue === 'transfert'
        "
         class="col-span-12 text-center justify-content-center font-bold text-2xl">
          Frais : {{ (chargerWallet.montant*taux)/100 }} FCFA
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
      <button type="button" @click="chargerFlotte" class="btn btn-primary w-32">
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
      label: "",
      vue: "",
      chargerWallet: {
        service: null,
        reference: null,
        beneficiaire: null,
        numero: null,
        montant: null,
        recipient: null,
        telephone: null,
        frais: null,
        commentaire: null,
      },
      selectedDebiteur: "",
      selectedCrediteur: "",
      selectedService: "",
      selectedChargementType: "",
      taux: "",
      typeService: "",
      listWallet: [],
      toEditData: [],
      listTypeCharge: [
        { id: "0", libelle: "Collect", ischecked: false },
        { id: "1", libelle: "Dotation", ischecked: false },
        { id: "2", libelle: "Gain", ischecked: false },
      ],
      listService: [
        { id: "0", libelle: "Airtime", ischecked: false },
        { id: "1", libelle: "Data", ischecked: false },
      ],
      solde: { airtime: "", data: "" },
      listFlotte: [],
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

    filteredListFlotte() {
      return this.listFlotte?.filter((row) => {
        const telephone = row.telephone?.toLowerCase();
        const solde = row.solde?.toLowerCase();
        const solde_data = row.solde_data?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const gain = row.gain?.toLowerCase();
        const date_creation = row.date_creation?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          telephone.includes(searchTerm) ||
          solde.includes(searchTerm) ||
          solde_data.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          gain.includes(searchTerm) ||
          date_creation.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllFlottes();
    this.getAllWallet();
    this.getTaux();
  },

  created() {
    document.title =
      "Flottes | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    detailFlotte(type, nom, data) {
      if (type === "transfert") {
        this.newOrderModal = true;
        this.vue = type;
        this.title = nom;
      } else {
        this.newOrderModal = true;
        this.title = nom;
        this.vue = type;
        this.toEditData = data;
      }
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedService = '';
      this.selectedChargementType = '';
    },

    getTaux() {
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getTauxTransfert`
        )
        .then((response) => {
          this.taux = [...response.data];
          console.log(this.taux);
        })
        .catch((error) => {
          this.$toast.open({
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
          this.listWallet = [...response.data];
          console.log(this.listWallet);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllFlottes() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllportefeuilleByClientByPage/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listFlotte = [...response.data.data];
          this.solde.airtime = response.data.solde_airtime;
          this.solde.data = response.data.volume_data;
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

    chargerFlotte() {
      console.log("toEditData is :", this.toEditData);
      this.isLoading = true;
      const data = {
        portefeuille: this.toEditData.id,
        montant: this.chargerWallet.montant,
        user_id: this.user.id,
        ...(this.selectedChargementType === "Gain"
          ? { operateur: this.toEditData.operateur }
          : {}),
        ...(this.selectedChargementType === "Dotation"
          ? { volume_data: this.chargerWallet.montant }
          : {}),
        ...(this.selectedChargementType === "Collect"
          ? {
              idportefeuille: this.achatData.commentaire,
              code_transaction: this.achatData.commentaire,
            }
          : {}),
      };
      let url;
      if (this.selectedChargementType === "Dotation") {
        url = "portefeuille/chargePortefeuilleByDotation";
      } else if (this.selectedChargementType === "Gain") {
        url = "portefeuille/chargePortefeuilleByGain";
      } else {
        url = "portefeuille/chargeCollectPortefeuille";
      }
      axios
        .put(`${Config.BASE_URL}${url}`, data)
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
            this.getAllFlottes();
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
      this.getAllFlottes();
    },

    exportExcel() {
      saveExcel({
        data: this.listFlotte,
        fileName: "Mes_Flottes",
        columns: [
          { field: "telephone", title: "Numéro" },
          { field: "solde", title: "Solde Airtime (Fcfa)" },
          { field: "solde_data", title: "Solde Data" },
          { field: "operateur", title: "Opérateur" },
          { field: "gain", title: "Gain (Fcfa)" },
          { field: "date_creation", title: "Date Création" },
        ],
      });
    },
  },
};
</script>