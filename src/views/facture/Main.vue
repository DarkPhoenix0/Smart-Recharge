<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto"> Mes factures </h2>
  <div class="text-right font-bold text-2xl">
    Solde <u>{{ solde.solde }} FCFA</u>
  </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListFacture">
    <div
      class="
        col-span-12
        flex flex-wrap
        sm:flex-nowrap
        items-center
        mt-2
      "
    >
      <!-- <button @click="exportExcel" class="btn btn-dark shadow-md mr-2">
        <i class="fas fa-file-excel"></i>&nbsp;Exporter
      </button> -->
      <button @click="getAllFacture" class="btn btn-light shadow-md mr-2">
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
            <th>DATE CRÉATION</th>
            <th>RÉFÉRENCE</th>
            <th>DESIGNATION</th>
            <th>QUANTITE</th>
            <th>PRIX HT (FCFA)</th>
            <th>PRIX TTC (FCFA)</th>
            <th>ETAT</th>
            <th>REGLER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listFacture.length" >
             <td colspan="8">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(facture, factureKey) in filteredListFacture"
            :key="factureKey"
            class=""
          >
            <!-- <td class="w-40 border border-slate-300"
            v-html="highlightMatches(facture.create_time)">
            </td> -->
            <td class="w-40 border border-slate-300">
              <a v-if="facture">{{ facture.create_time }}</a>
            </td>
            <td style="cursor: pointer;" class="w-20 border border-slate-300">
              <a v-if="facture" @click="showFacture(facture)" >{{ facture.reference }}</a>
            </td>
            <td class="w-60 border border-slate-300"
            v-html="highlightMatches(facture?.designation)">
            </td>
            <td class="w-20 border border-slate-300">
              <a v-if="facture">{{ facture.quantite }}</a>
            </td>
            <!-- <td class="w-20 border border-slate-300"
            v-html="highlightMatches(facture.quantite)">
            </td> -->
            <td class="w-40 border border-slate-300"
            v-html="highlightMatches(facture?.prix_ht)">
            </td>
            <td class="w-40 border border-slate-300"
            v-html="highlightMatches(facture?.prix_ttc)">
            </td>
            <td class="w-20 border border-slate-300">
               <span  v-if="facture"
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-red-600 rounded text-white':
                    facture.etat == '4',
                  'bg-red-600 rounded text-white':
                    facture.etat == '3',
                  'bg-green-500 rounded text-white':
                    facture.etat == '2',
                    'bg-gray-500 rounded text-white':
                    facture.etat == '1',
                    'bg-yellow-500 rounded text-white':
                    facture.etat == '0',
                }"

              >
                {{ facture.etat == '0' ? 'En attente' : facture.etat == '1' ? 'Confirmée' : facture.etat == '2' ? 'Soldée' : 'Annulée' }} 
              </span>
            </td>
            <td class="w-0 border border-slate-300">
              <button v-if="facture.etat == '0' || facture.etat == '1'" class="btn btn-primary" @click="regler(facture)">
                Regler
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- END: Data List -->
    <!-- BEGIN: Pagination -->
    <div
      class="col-span-12 text-right"
    >
      <Pagination
        :total-pages="totalPages"
        :per-page="recordsPerPage"
        :current-page="page"
        @pagechanged="onPageChange"
      />
    </div>
    <!-- END: Pagination -->
  </div>
  <div class="container mx-auto sm:px-4 pt-4" v-if="viewFacture">
        <div class="flex flex-wrap">
            <div class="w-full">
                <div class="relative flex flex-col min-w-0 rounded break-words border bg-white border-1 border-gray-300 overflow-auto lg:overflow-visible">
                <div class="text-right py-2 px-2">
                  <button class="btn btn-danger w-24 ml-2"
                    @click="showFacture"
                    type="button">Fermer</button>
                </div>
                    <div class="flex-auto p-6 p-0">
                        <div class="flex flex-wrap  p-12">
                            <div class="md:w-1/2 pr-4 pl-24">
                                <img src="/logo_imako.png" width="450" height="150" />
                            </div>

                            <div class="md:w-1/2 pr-4 pl-4 text-xl">
                                <p class="text-gray-700">
                                    <span class="text-blue">RCCM :</span>CI-ABJ-2016-B-6684 <span class="text-blue">CC :</span> 1613729B <br />
                                    ABIDJAN - COCODY ANGRE 8 IEME TRANCHE <br />
                                    25 BP 622 ABIDJAN 01 <br />
                                    <span class="text-blue">Email :</span>infos@imako.ci - <span class="text-blue">Web :</span> imako.ci <br />
                                    <span class="text-blue">Contacts :</span>+225 58040404 / +225 52000406
                                </p>
                            </div>
                        </div>
                        <div class="flex flex-wrap  pb-5 p-12">
                            <div class="md:w-full pr-4 pl-4">
                                <table class="w-full max-w-full mb-4 bg-transparent table table-bordered">
                                    <tbody>
                                        <tr class="background-blue white">
                                            <td>
                                                <center>
                                                    <b>DATE</b>
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <b>VALIDITE</b>
                                                </center>
                                            </td>
                                            <td>
                                                <center>
                                                    <b>REFERENCE</b>
                                                </center>
                                            </td>
                                            <td rowspan="2">
                                                <br />
                                                <center>
                                                    <b class="fs-16">A l'attention de</b>
                                                </center>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <center class="">
                                                   {{ factureData.date}}
                                                </center>
                                            </td>
                                            <td>
                                                <center class="">
                                                   {{ factureData.validite}} JOURS
                                                </center>
                                            </td>
                                            <td>
                                                <center class="">
                                                    {{factureData.reference}}
                                                </center>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="imako-color">
                                                <center>
                                                    FACTURE PROFORMA
                                                </center>
                                            </td>
                                            <td>
                                                <br />
                                                <center>
                                                    <b class="fs-16 "> {{factureData.societe}}</b>
                                                </center>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colspan="3"></td>
                                            <td>
                                                <center class="">
                                                    Suivi par {{factureData.commercial}} [{{factureData.contact_commercial}} | {{factureData.mail_commercial}}]
                                                </center>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!--end row-->

                        <div class="flex flex-wrap  p-6">
                            <div class="md:w-full pr-4 pl-4">
                                <br/>
                                <br/>
                                <table class="table table-bordered border-collapse border border-slate-400">
                                    <thead class="background-blue white">
                                        <tr>
                                            <th>Code</th>
                                            <th>Quantité</th>
                                            <th>Description</th>
                                            <th>Prix unitaire</th>
                                            <th>Montant HT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="">{{factureData.reference}}</td>
                                            <td class="">{{factureData.qte}}</td>
                                            <td>
                                                <b class="">
                                                    {{factureData.designation}}
                                                </b>
                                            </td>
                                            <td>
                                                <center class="">
                                                    {{factureData.pu}}
                                                </center>
                                            </td>
                                            <td class="background-yellow">
                                                <center class="">
                                                    {{factureData.montant_ht}}
                                                </center>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>Total (HT)</td>
                                            <td class="background-yellow">
                                                <center class="">
                                                    {{factureData.montant_ht}}
                                                </center>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                <center>
                                                    Taux de TVA
                                                </center>
                                            </td>
                                            <td>
                                                <center class="">
                                                     {{factureData.tva}} %
                                                </center>
                                            </td>
                                            <td class="background-yellow">
                                                <center class="">
                                                    {{factureData.montant_tva}}
                                                </center>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                <b>
                                                    Total T.T.C. FCFA
                                                </b>
                                            </td>
                                            <td class="background-yellow">
                                                <center>
                                                    <b class="">
                                                         {{factureData.montant_ttc}}
                                                    </b>
                                                </center>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!--end row-->
                        <div class="flex flex-wrap  p-12">
                            <div class="md:w-full pr-4 pl-4">
                                <center>Arrêté cette facture à la somme de <b class="">{{factureData.montant_ttc_en_lettre}}</b> francs cfa TTC sauf erreur</center>
                            </div>
                        </div>
                        <!--end row-->
                        <div class="flex flex-wrap  p-12">
                            <div class="md:w-1/2 pr-4 pl-4">
                                <table class="w-full max-w-full mb-4 bg-transparent table table-bordered">
                                    <tbody>
                                        <tr class="background-blue white">
                                            <th colspan="2">
                                                <center>
                                                    CONDITIONS DE PAIEMENT
                                                </center>
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Acompte à la commande</td>
                                            <td> 0%</td>
                                        </tr>
                                        <tr>
                                            <td>Solde à la reception</td>
                                            <td> 100%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="md:w-1/2 pr-4 pl-4">
                                <table class="w-full max-w-full mb-4 bg-transparent table table-bordered">
                                    <tbody>
                                        <tr class="background-blue white">
                                            <th colspan="2">
                                                <center>
                                                    MODES DE PAIEMENT
                                                </center>
                                            </th>
                                        </tr>
                                        <tr>
                                            <td>Chèques à l'ordre de :</td>
                                            <td class=""> {{factureData.cheque_ordre}}</td>
                                        </tr>
                                        <tr>
                                            <td>Banque :</td>
                                            <td class=""> {{factureData.bank}}</td>
                                        </tr>
                                        <tr>
                                            <td>Compte :</td>
                                            <td class=""> {{factureData.compte_bancaire}}</td>
                                        </tr>
                                        <tr>
                                            <td>Mobile Money (collect)</td>
                                            <td class=""> {{factureData.mobil_money}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!--end row-->
                    </div>
                </div>
            </div>
        </div>
</div>

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
      viewListFacture: true,
      viewFacture: false,
      listFacture: [],
      factureData : {},
      solde: {'solde': ''},
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
    filteredListFacture() {
      return this.listFacture.filter((row) => {
        const create_time = row.create_time;
        const reference = row.reference.toLowerCase();
        const designation = row.designation.toLowerCase();
        const quantite = row.quantite;
        const prix_ht = row.prix_ht.toLowerCase();
        const prix_ttc = row.prix_ttc.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time ||
          reference.includes(searchTerm) ||
          designation.includes(searchTerm) ||
          quantite ||
          prix_ht.includes(searchTerm) ||
          prix_ttc.includes(searchTerm) 
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllFacture();
  },
  created() {
    document.title =
      "Mes Factures | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    getAllFacture() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllFacture/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listFacture = [...response.data.data];
          this.solde.solde = response.data.solde;
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

    showFacture(data) {
        this.viewListFacture = !this.viewListFacture;
        this.viewFacture = !this.viewFacture;
        axios
        .get(
          `${Config.BASE_URL}dotation/afficheProforma/${data.id}`
        )
        .then((response) => {
          console.log('response is :', response.data);
          this.factureData = response.data;
          console.log('factureData is :', this.factureData);
        })
    },

    onPageChange(page) {
      this.page = page;
      this.getAllFacture();
    },

    exportExcel() {
      saveExcel({
        data: this.listFacture.data,
        fileName: "Mes_Facture",
        columns: [
          { field: "etat", title: "Etat" },
          { field: "create_time", title: "Date" },
          { field: "emetteur", title: "Emetteur" },
          { field: "nom + prenom", title: "Bénéficiaire" },
          { field: "service", title: "Service" },
          { field: "cout", title: "Coût(FCFA)" },
          { field: "telephone", title: "Numéro" },
          { field: "operateur", title: "Opérateur" },
          { field: "type_transaction", title: "Type Transaction" },
          { field: "sim_source", title: "SIM source" },
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
