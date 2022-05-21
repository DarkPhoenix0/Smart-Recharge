<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Mes paiements</h2>
    <div class="text-right font-bold text-2xl">
      Solde <u>{{ solde.solde }} FCFA</u>
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
      <button v-on:click="newPaiement('Nouveau paiement')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllPaiement" class="btn btn-light shadow-md mr-2">
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
            <th>DATE</th>
            <th>RÉFÉRENCE PAIEMENT</th>
            <th>MONTANT</th>
            <th>MODE PAIEMENT</th>
            <th>ETAT</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listPaiement.length" >
             <td colspan="7">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(paiement, paiementKey) in filteredListPaiement"
            :key="paiementKey"
            class=""
          >
            <td v-html="highlightMatches(paiement?.create_time)"
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(paiement?.numero_trans)"
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(paiement?.montant)"
            class="w-20 border border-slate-300">
            </td>
            <td v-html="highlightMatches(paiement?.mode_paiement)"
            class="w-20 border border-slate-300">
            </td>
            <td class="w-20 border border-slate-300">
              <div
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-yellow-400 rounded text-dark-700':
                    paiement.etat === 'en attente',
                  'bg-green-500 rounded text-white':
                    paiement.etat === 'validé',
                }"
              >
                {{ paiement.etat }}
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
       <b class="text-2xl">{{title}}</b>
      <!-- <h2 class="font-medium text-base mr-auto">Transférer flotte</h2> -->
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Mode de paiement <span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedMode"
          :options="{
            placeholder: 'Selectionner le mode de paiement',
            closeAfterSelect: true,
            plugins: {
              dropdown_header: {
                title: 'Mode de paiement',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option
            v-for="(mode, modeKey) in listMode"
            :key="modeKey"
            :value="mode.id"
          >
            {{ mode.libele }}
          </option>
        </TomSelect>
      </div>
       <div v-if="selectedMode == '4'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Code swift <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.swift_code"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le code swift"
        />
      </div>
      <div v-if="selectedMode === 'CHEQUE' || selectedMode == '4'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Banque <span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedBank"
          :options="{
            placeholder: 'Selectionner la banque',
            closeAfterSelect: true,
            plugins: {
              dropdown_header: {
                title: 'Banque',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option
            v-for="(bank, bankKey) in listBank"
            :key="bankKey"
            :value="bank.id"
          >
            {{ bank.sigle }} ({{ bank.denomination }})
          </option>
        </TomSelect>
      </div>
      <div v-if="selectedMode == '3'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">N° borderau <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.borderau_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro de borderau"
        />
      </div>
      <div v-if="selectedMode == '4'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Montant <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.montant"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le montant"
        />
      </div>
      <div v-if="selectedMode == 'VIREMENT'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Nom déposant <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.nom_deposant"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le nom du déposant"
        />
      </div>
      <div v-if="selectedMode == '2'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">N° Transaction <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.transac_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro de la transaction"
        />
      </div>
      <div v-if="selectedMode == 'MOMO'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">N° chèque <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.cheque"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro du chèque"
        />
      </div>
      <div v-if="selectedMode === 'CHEQUE'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Date remise <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.date_remise"
          id="pos-form-3"
          type="date"
          class="form-control flex-1"
          placeholder="Entrez le date de remise"
        />
      </div>
      <div v-if="selectedMode === 'CHEQUE' || selectedMode == '4'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Titulaire du compte <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.titulaire"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le titulaire du compte"
        />
      </div>
      <div v-if="selectedMode === 'CHEQUE'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Numero du compte <span class="text-danger">*</span></label>
        <input
        v-model="createPaiement.compte_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numero du compte"
        />
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2">Mot de passe <span class="text-danger">*</span></label>
        <input 
        v-model="createPaiement.password"
          id="pos-form-3"
          v-mask="'#####'"
          type="password"
          class="form-control flex-1"
          placeholder="Entrez le mot de passe"
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
      <button type="button" 
      @click="makePaiement"
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
      vue: "",
      createPaiement: {
        password : 12345,
        compte_num : null,
        titulaire : null,
        date_remise : null,
        swift_code : null,
        cheque : null,
        transac_num : null,
        nom_deposant : null,
        montant : null,
        borderau_num : null,
      },
      selectedMode: "",
      selectedBank: "",
      listBank: [],
      listMode: [],
      solde: {'solde': ''},
      listPaiement: [],
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
    filteredListPaiement() {
      
      return this.listPaiement.filter((row) => {
        const create_time = row.create_time.toLowerCase();
        const numero_trans = row.numero_trans.toLowerCase();
        const montant = row.montant.toLowerCase();
        const mode_paiement = row.mode_paiement.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          numero_trans.includes(searchTerm) ||
          montant.includes(searchTerm) ||
          mode_paiement.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllPaiement();
  },


  created() {
    document.title =
      "Mes paiements | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newPaiement(nom) {
      this.getAllBank();
      this.getModePaiement()
      this.newOrderModal = true
      this.title = nom;
      this.createPaiement.password = 12345;
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedBank = "";
      this.selectedMode = "";
      this.createPaiement = {};
      // this.listPaiement = [];
    },

    getAllBank() {
      axios
        .get(
          `${Config.BASE_URL}money/getAllBank`
        )
        .then((response) => {
          this.listBank = [...response.data];
          console.log(this.listBank);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getModePaiement() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllModePaiement`
        )
        .then((response) => {
          console.log('paiement mode is :', response)
          this.isLoading = false;
          this.listMode = [...response.data];
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

    getAllPaiement() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllReferencePaiement/${this.page}`
        )
        .then((response) => {
          console.log('allpaiement  is :', response);
          this.isLoading = false;
          this.listPaiement = [...response.data.data];
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

    makePaiement() {
      this.isLoading = true;
      const data = {
        mode_paiement: this.selectedMode,
        password: this.createPaiement.password,
        user_id: this.user.id,
        ...(this.selectedMode == "3" || this.selectedMode == "4" || this.selectedMode == "5" 
        ? {montant : this.createPaiement.montant,}
        : {}),
        ...(this.selectedMode == "4"
        ? {banque_id : this.selectedBank, titulaire : this.createPaiement.titulaire, numero_trans: this.createPaiement.swift_code,}
        : {}),
        ...(this.selectedMode == "2"
        ? { numero_trans: this.createPaiement.transac_num,}
        : {}),
      };
       let url;
      if (this.selectedMode == "2") {
        url = "dotation/register_paiement_momo";
      } else if (this.selectedMode == "4") {
        url = "dotation/register_paiement_virement";
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
            this.closeModal();
            this.getAllPaiement();
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
      this.getAllPaiement();
    },

    exportExcel() {
      saveExcel({
        data: this.listPaiement,
        fileName: "Mes_Paiements",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "numero_trans", title: "Reférence Paiement" },
          { field: "montant", title: "Montant" },
          { field: "mode_paiement", title: "Mode paiement" },
          { field: "etat", title: "Etat" },
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
