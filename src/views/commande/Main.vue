
<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto"> Mes commandes </h2>
  <div class="text-right font-bold text-2xl">
    Solde <u>{{ solde.solde }} FCFA</u>
  </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListCommande">
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
      <button @click="getAllCommande" class="btn btn-light shadow-md mr-2">
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
            <th>RÉF.</th>
            <th>DESIGNATION</th>
            <th>QTE</th>
            <th>PRIX HT (FCFA)</th>
            <th>PRIX TTC (FCFA)</th>
            <th>DATE SOUMISSION</th>
            <th>ETAT</th>
            <th>ACTION</th>
            <th>REGLER</th>
            <th>EMETTEUR</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listCommande.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(commande, commandeKey) in filteredListCommande"
            :key="commandeKey"
            class=""
          >
            <td class="w-60 border border-slate-300"
            v-html="highlightMatches(commande?.create_time)">
            </td>
            <td style="cursor: pointer;" class="w-40 border border-slate-300">
              <a v-if="commande" @click="showFacture(commande)" >{{ commande.reference }}</a>
            </td>
            <td class="w-60 border border-slate-300"
            v-html="highlightMatches(commande?.designation)">
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="commande">{{ commande.quantite }}</span>
            </td>
            <td class="w-40 border border-slate-300"
            v-html="highlightMatches(commande?.prix_ht)">
            </td>
            <td class="w-40 border border-slate-300"
            v-html="highlightMatches(commande?.prix_ttc)">
            </td>
            <td class="w-60 border border-slate-300"
            v-html="highlightMatches(commande.date_soumission)">
            </td>
            <td class="w-20 border border-slate-300">
               <span  v-if="commande"
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-red-600 rounded text-white':
                    commande.etat == '4',
                  'bg-red-600 rounded text-white':
                    commande.etat == '3',
                  'bg-green-500 rounded text-white':
                    commande.etat == '2',
                    'bg-gray-500 rounded text-white':
                    commande.etat == '1',
                    'bg-yellow-500 rounded text-white':
                    commande.etat == '0',
                }"
              >
                {{ commande.etat == '0' ? 'En attente' : commande.etat == '1' ? 'Confirmé' : commande.etat == '2' ? 'Traitée' : 'Annulée' }}
              </span>
            </td>
            <td class="w-20 border border-slate-300">
              <button v-if="commande.etat == '1' || commande.etat == '0'"
                type="button"
                class="rounded-lg text-white text-sm px-5 py-2.5 mr-2"
                :class="[commande.etat == '1' ? 'bg-red-600 :bg-red-600' : commande.etat == '0' ? 'bg-green-600 dark:bg-green-800' : '']"
                @click="annulerCommande(commande)"
                >{{commande.etat == '1' ? 'Annuler' : commande.etat == '0' ? 'Confirmer' : ''}}</button>
            </td>
            <td class="w-20 border border-slate-300">
              <button v-if="commande.etat == '2'"  class="btn btn-primary" @click="regler(commande)">
                Regler
              </button>
            </td>
            <td class="w-20 border border-slate-300"
            v-html="highlightMatches(commande.email)">
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
                            <div class="md:w-1/2 pr-4 pl-4">
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
                                                   {{ commandeData.date}}
                                                </center>
                                            </td>
                                            <td>
                                                <center class="">
                                                   {{ commandeData.validite}} JOURS
                                                </center>
                                            </td>
                                            <td>
                                                <center class="">
                                                    {{commandeData.reference}}
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
                                                    <b class="fs-16 "> {{commandeData.societe}}</b>
                                                </center>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colspan="3"></td>
                                            <td>
                                                <center class="">
                                                    Suivi par {{commandeData.commercial}} [{{commandeData.contact_commercial}} | {{commandeData.mail_commercial}}]
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
                                            <td class="">{{commandeData.reference}}</td>
                                            <td class="">{{commandeData.qte}}</td>
                                            <td>
                                                <b class="">
                                                    {{commandeData.designation}}
                                                </b>
                                            </td>
                                            <td>
                                                <center class="">
                                                    {{commandeData.pu}}
                                                </center>
                                            </td>
                                            <td class="background-yellow">
                                                <center class="">
                                                    {{commandeData.montant_ht}}
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
                                                    {{commandeData.montant_ht}}
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
                                                     {{commandeData.tva}} %
                                                </center>
                                            </td>
                                            <td class="background-yellow">
                                                <center class="">
                                                    {{commandeData.montant_tva}}
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
                                                         {{commandeData.montant_ttc}}
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
                                <center>Arrêté cette commande à la somme de <b class="">{{commandeData.montant_ttc_en_lettre}}</b> francs cfa TTC sauf erreur</center>
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
                                            <td class=""> {{commandeData.cheque_ordre}}</td>
                                        </tr>
                                        <tr>
                                            <td>Banque :</td>
                                            <td class=""> {{commandeData.bank}}</td>
                                        </tr>
                                        <tr>
                                            <td>Compte :</td>
                                            <td class=""> {{commandeData.compte_bancaire}}</td>
                                        </tr>
                                        <tr>
                                            <td>Mobile Money (collect)</td>
                                            <td class=""> {{commandeData.mobil_money}}</td>
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
      viewListCommande: true,
      viewFacture: false,
      listCommande: [],
      commandeData : {},
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
    filteredListCommande() {
      return this.listCommande.filter((row) => {
        const create_time = row.create_time;
        const reference = row.reference.toLowerCase();
        const designation = row.designation.toLowerCase();
        const quantite = row.quantite;
        const prix_ht = row.prix_ht.toLowerCase();
        const prix_ttc = row.prix_ttc.toLowerCase();
        const date_soumission = row.date_soumission.toLowerCase();
        const etat = row.etat;
        const email = row.email.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time ||
          reference.includes(searchTerm) ||
          designation.includes(searchTerm) ||
          quantite ||
          prix_ht.includes(searchTerm) ||
          prix_ttc.includes(searchTerm) ||
          date_soumission.includes(searchTerm) ||
          etat ||
          email.includes(searchTerm) 
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllCommande();
  },
  created() {
    document.title =
      "Mes Commandes | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    getAllCommande() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllProforma/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listCommande = [...response.data.data];
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

    annulerCommande(data) {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/supprimerCommande/${data.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.getAllCommande();
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
        this.viewListCommande = !this.viewListCommande;
        this.viewFacture = !this.viewFacture;
        axios
        .get(
          `${Config.BASE_URL}dotation/afficheProforma/${data.id}`
        )
        .then((response) => {
          console.log('response is :', response.data);
          this.commandeData = response.data;
          console.log('commandeData is :', this.commandeData);
        })
    },

    regler(datas) {
      this.isLoading = true;
      const data = {
        id: datas.id,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}dotation/reglerCommande`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          }  else {
            this.getAllCommande();
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
      this.getAllCommande();
    },

    exportExcel() {
      saveExcel({
        data: this.listCommande,
        fileName: "Mes_Commandes",
        columns: [
           { field: "create_time", title: "Date création" },
          { field: "reference", title: "Référence" },
          { field: "designation", title: "Désignation" },
          { field: "quantite", title: "Quantité" },
          { field: "prix_ht", title: "Prix HT (FCFA)" },
          { field: "prix_ttc", title: "Prix TTC (FCFA)" },
          { field: "date_soumission", title: "Date soumission" },
          { field: "etat", title: "Etat" },
          { field: "email", title: "Emetteur" },
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