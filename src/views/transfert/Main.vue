<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <h2 class="text-2xl font-medium mt-10">
    <b>Liste des transactions MoMo</b>
  </h2>
  <div class="grid grid-cols-12 gap-6 mt-5" >
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <!-- <button class="btn btn-primary shadow-md mr-2">
        Transfert
      </button> -->
      <!-- <button @click="exportExcel" class="btn btn-dark shadow-md mr-2">
        <i class="fas fa-file-excel"></i>&nbsp;Exporter
      </button> -->
      <button @click="getAllTransactionsMoney" class="btn btn-light shadow-md mr-2">
        <i class="fas fa-refresh"></i>&nbsp;Rafraichir
      </button>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--        Showing 1 to 10 of 150 entries-->
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
            <th>OPÉRATION</th>
            <th>RÉFÉRENCE</th>
            <th>BÉNÉFICIAIRE</th>
            <th>SOLDE AVANT (FCFA)</th>
            <th>MONTANT (FCFA)</th>
            <th>FRAIS (FCFA)</th>
            <th>TOTAL (FCFA)</th>
            <th>OPÉRATEUR</th>
            <th>ETAT</th>
            <!-- <th>COMMENTAIRE</th> -->
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listTransactionsMoney.length" >
             <td colspan="10">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(money, moneyKey) in listTransactionsMoney"
            :key="moneyKey"
          >
            <td
              v-html="money?.create_time" 
              class="w-60 border border-slate-300"
            ></td>
            <td
              v-html="money?.typeoperation"
              class="w-40 border border-slate-300"
            ></td>
            <td
              v-html="money?.reference_transaction"
              class="w-40 border border-slate-300"
            ></td>
            <td
              v-html="money?.numero"
              class="w-40 border border-slate-300"
            ></td>
                        <td
              v-html="money?.gain"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="money?.montant"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="money?.frais"
              class="w-20 border border-slate-300"
            ></td>
            <td
              v-html="money?.montant_total"
              class="w-20 border border-slate-300"
            ></td>
            <td v-html="money?.operateur" class="w-20 border border-slate-300"></td>
            <!-- <td
              v-html="money?.etat"
              class="w-40"
            ></td> -->
            <!-- <td
              v-html="money?.commentaire"
              class="w-40"
            ></td> -->
             <td class="w-20 border border-slate-300">
              <div
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-yellow-400 rounded text-dark-700':
                    money.etat === 'en attente',
                  'bg-green-500 rounded text-white':
                    money.etat === 'traité',
                }"
              >
                {{ money.etat }}
              </div>
            </td>
            <!-- <td
              v-html="highlightMatches(money.emetteur)"
              class="w-40"
            ></td>  -->
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
      listTransactionsMoney: [],
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
    filteredListTransactionsMoney() {
      return this.listTransactionsMoney?.filter((row) => {
        const date = row.create_time?.toLowerCase();
        const typeoperation = row.typeoperation?.toLowerCase();
        const frais = row.frais?.toLowerCase();
        const montant_total = row.montant_total?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const gain = row.gain?.toLowerCase();
        const numero = row.numero?.toLowerCase();
        const reference_transaction = row.reference_transaction?.toLowerCase();
        const etat = row.commentaire?.toLowerCase();
        const commentaire = row.commentaire?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          date.includes(searchTerm) ||
          typeoperation.includes(searchTerm) ||
          frais.includes(searchTerm) ||
          montant_total.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          gain.includes(searchTerm) ||
          numero.includes(searchTerm) ||
          reference_transaction.includes(searchTerm) ||
          numero.includes(searchTerm) ||
          etat.includes(searchTerm) ||
          commentaire.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllTransactionsMoney();
  },
  created() {
    document.title =
      "Tranactions MoMo | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    highlightMatches(text) {
    //   const matchExists = text
    // .toLowerCase()
    //  .includes(this.search.toLowerCase());
    //  if (!matchExists) return text;
    //  const re = new RegExp(this.search, "ig");
    //  return text.replace(
    //    re,
    //    (matchedText) =>
    //      `<span style="background-color:#f1c40f;" >${matchedText}</span>`
    //  );
    },

    
    getAllTransactionsMoney() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}money/getAllTransactionMoneyClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listTransactionsMoney = [...response.data.data];
          this.listTransactionsMoney = response.data.data;
          this.totalPages = response.data.last_page;
          this.totalRecords = response.data.total;
        })
        .catch((error) => {
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },
    
    onPageChange(page) {
      this.page = page;
      this.getAllTransactionsMoney();
    },

    exportExcel() {
      saveExcel({
        data: this.listTransactionsMoney,
        fileName: "Mes_Transactions",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "typeoperation", title: "Type operation" },
          { field: "montant", title: "Montant" },
          { field: "cout", title: "Coût (fcfa)" },
          { field: "frais", title: "Frais" },
          { field: "montant_total", title: "Flotte" },
          { field: "operateur", title: "Etat" },
          { field: "gain", title: "Initiateur" },
          { field: "numero", title: "Initiateur" },
          { field: "reference_transaction", title: "Initiateur" },
          { field: "commentaire", title: "Initiateur" },
          { field: "etat", title: "Initiateur" },
        ],
      });
    },
  },
};
</script>

