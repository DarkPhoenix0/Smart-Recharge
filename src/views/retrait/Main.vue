<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Retraits</h2>
    <div class="text-right font-bold text-2xl">
      Solde <u>{{ solde.solde }} FCFA</u> | GAIN
      <u>{{ solde.gain }} FCFA</u>	Dernière transaction | <u>{{ solde.last_transaction }}</u>
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
        v-on:click="newRetrait('Reférence de transaction')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-envelope"></i>&nbsp;Nouveau
      </button>
      <button @click="getAllRetrait" class="btn btn-light shadow-md mr-2">
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
            <th>DATE	</th>
            <th>OPÉRATION</th>
            <th>RÉFÉRENCE</th>
            <th>BÉNÉFICIAIRE</th>
            <th>MONTANT(FCFA)</th>
            <th>FRAIS(FCFA)</th>
            <th>MONTANT TOTAL(FCFA)</th>
            <th>GAIN (FCFA)</th>
            <th>OPÉRATEUR</th>
            <th>ETAT</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listRetrait.length" >
             <td colspan="10">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(retrait, retraitKey) in listRetrait"
            :key="retraitKey"
            class=""
          >
            <td v-html="highlightMatches(retrait.create_time)" 
            class="w-40 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.operation)" 
            class="w-40 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.reference)" 
            class="w-40 text-center" 
                ></td>
           <td v-html="highlightMatches(retrait.beneficiaire)" 
           class="w-60 text-center" 
                > </td>
            <td v-html="highlightMatches(retrait.montant)" 
            class="w-20 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.frais)" 
            class="w-20 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.montant_total)" 
            class="w-20 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.gain)" 
            class="w-20 text-center" 
                ></td>
            <td v-html="highlightMatches(retrait.operateur)" 
            class="w-20 text-center" 
                ></td>
            <td class="w-40">
              <div
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-yellow-400 rounded text-dark-700':
                    retrait.etat === 'en attente',
                  'bg-green-500 rounded text-white':
                    retrait.etat === 'traité',
                }"
              >
                {{ retrait.etat }}
              </div>
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
      <b class="text-2xl">{{ title }}</b>
      <!-- <h2 class="font-medium text-base mr-auto">Transférer flotte</h2> -->
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div
        class="col-span-12 sm:col-span-12"
      >
        <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
        <input
        id="pos-form-3"
        v-model="retraitMoney.reference"
        type="text"
        class="form-control flex-1 mr-2"
        placeholder="Entrez la réference transaction"
      />
        <button v-on:click="getReferenceCode"
          class="btn btn-dark shadow-md">
          <i class="fa fa-search"></i>&nbsp; Rechercher
        </button>
        </div>
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
      <button type="button" @click="retraitMomo" class="btn btn-primary w-32">
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
      retraitMoney: {
        reference: null,
      },
      solde: { solde: "", gain: "", last_transaction: "" },
      listRetrait: [],
      listReference: "",
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

    filteredListRetrait() {
      return this.listRetrait?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const operation = row.operation?.toLowerCase();
        const beneficiaire = row.beneficiaire?.toLowerCase();
        const montant = row.montant?.toLowerCase();
        const frais = row.frais?.toLowerCase();
        const montant_total = row.montant_total?.toLowerCase();
        const gain = row.gain?.toLowerCase();
        const operateur = row.operateur?.toLowerCase(); 
        const etat = row.etat?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          operation.includes(searchTerm) ||
          beneficiaire.includes(searchTerm) ||
          montant.includes(searchTerm) ||
          frais.includes(searchTerm) ||
          montant_total.includes(searchTerm) ||
          gain.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          etat.includes(searchTerm)
        );
      });
    },
  },
  
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllRetrait();
    //this.getReferenceCode();
  },

  created() {
    document.title =
      "Retrait | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newRetrait(nom) {
        this.newOrderModal = true;
        this.title = nom;
    },

    closeModal() {
      this.newOrderModal = false;
    },

    getReferenceCode() {

      const data = {
        code: this.retraitMoney.reference,
        user_id: this.user.id,
      };

      axios
        .post(
          `${Config.BASE_URL}money/getCollectByCode`, data
        )
        .then((response) => {
          this.reference = response.data.collect;
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllRetrait() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}money/getAllTransactionRetraitMoneyClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listRetrait = [...response.data.list];
          this.solde.solde = response.data.infocompte.solde;
          this.solde.gain = response.data.infocompte.gain;
          this.solde.last_transaction = response.data.infocompte.last_transaction;
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

    retraitMomo() {
      this.isLoading = true;
      const data = {
        reference: this.retraitMoney.reference,
        message: this.envoiSMS.message,
        numero: this.envoiSMS.numero,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/chargeCollectPortefeuille`, data)
        .then((response) => {
          this.isLoading = false;

          console.log(response);
          this.listReference = [...response.data];
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
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

    findReference() {
      this.isLoading = true;
      const data = {
        reference: this.retraitMoney.reference,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/chargeCollectPortefeuille`, data)
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
      this.getAllRetrait();
    },

    exportExcel() {
      saveExcel({
        data: this.listRetrait,
        fileName: "Mes_Retraits",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "operation", title: "Opération" },
          { field: "reference", title: "Référence" },
          { field: "beneficiaire", title: "Bénéficiaire" },
          { field: "montant", title: "Montant(Fcfa)" },
          { field: "frais", title: "Frais(Fcfa)" },
          { field: "solde_data", title: "Montant Total(Fcfa)" },
          { field: "gain", title: "Gain (Fcfa)" },
          { field: "operateur", title: "Opérateur" },
          { field: "etat", title: "Etat" },
        ],
      });
    },
  },
};
</script>

