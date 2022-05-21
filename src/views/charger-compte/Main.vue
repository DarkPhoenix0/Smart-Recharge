<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">
      Chargement compte Money
    </h2>
    <div class="text-right font-bold text-2xl">
      Airtime <u>{{ solde.solde }} FCFA</u> | Gain <u>{{ solde.gain }} MB</u> |
      Dernière transaction <u>{{ solde.last_transaction }}</u>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <button
        v-on:click="newCompte('Nouveau compte')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getChargementMoney" class="btn btn-light shadow-md mr-2">
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
      <table
        class="table table-bordered border-collapse border border-slate-400"
      >
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
          <tr class="text-center" v-if="!listChargementMoney.length">
            <td colspan="10">
              <div class="justify-content-center text-2xl">
                <b>Aucune donnée disponible</b>
              </div>
            </td>
          </tr>
          <tr
            v-for="(money, moneyKey) in listChargementMoney"
            :key="moneyKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="money">{{ money.telephone }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="money">{{ money.solde }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="money">{{ money.solde_data }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="money">{{ money.operateur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="money">{{ money.gain }}</span>
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
      <div class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Mode de paiement<span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedPaymentMode"
          :options="{
            placeholder: 'Selectionner le mode de paiement',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Mode de paiement',
              },
            },
          }"
          class="w-full"
        >
          <option value=""></option>
          <option
            v-for="(paymentmode, paymentmodeKey) in listPaymentMode"
            :value="paymentmode.libelle"
          >
            {{ paymentmode.libelle }}
          </option>
        </TomSelect>
      </div>
      <div v-if="selectedPaymentMode === 'VIREMENT'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Code swift <span class="text-danger">*</span></label
        >
        <input
          v-model="swift_code"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le code swift"
        />
      </div>
      <div
        v-if="
          selectedPaymentMode === 'CHÈQUE' ||
          selectedPaymentMode === 'MOMO' ||
          selectedPaymentMode === 'VIREMENT'
        "
        class="col-span-12"
      >
        <label for="pos-form-1" class="text-xs font-bold mb-2"
          >Banque<span class="text-danger">*</span></label
        >
        <TomSelect
          v-model="selectedBank"
          :options="{
            placeholder: 'Selectionner la banque',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Banque',
              },
            },
          }"
          class="w-full"
        >
          <option v-for="(bank, bankKey) in listBank" :value="bank.sigle">
            {{ bank.sigle }} ({{ bank.denomination }})
          </option>
        </TomSelect>
      </div>
      <div v-if="selectedPaymentMode === 'VIREMENT'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >N° borderau <span class="text-danger">*</span></label
        >
        <input
          v-model="borderau_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro de borderau"
        />
      </div>
      <div v-if="selectedPaymentMode !== 'MOMO'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Montant <span class="text-danger">*</span></label
        >
        <input
          v-model="montant"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le montant"
        />
      </div>
      <div v-if="selectedPaymentMode === 'DÉPÔT'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Nom déposant <span class="text-danger">*</span></label
        >
        <input
          v-model="nom_deposant"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le nom du déposant"
        />
      </div>
      <div v-if="selectedPaymentMode === 'MOMO'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >N° Transaction <span class="text-danger">*</span></label
        >
        <input
          v-model="transac_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro de la transaction"
        />
      </div>
      <div v-if="selectedPaymentMode === 'MOMO' || selectedPaymentMode === 'CHÈQUE'  " class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >N° chèque <span class="text-danger">*</span></label
        >
        <input
          v-model="cheque"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numéro du chèque"
        />
      </div>
      <div v-if="selectedPaymentMode === 'CHÈQUE'" class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Date remise <span class="text-danger">*</span></label
        >
        <input
          v-model="date_remise"
          id="pos-form-3"
          type="date"
          class="form-control flex-1"
          placeholder="Entrez le date de remise"
        />
      </div>
      <div
        v-if="
          selectedPaymentMode === 'CHÈQUE' || selectedPaymentMode === 'VIREMENT'
        "
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Titulaire du compte <span class="text-danger">*</span></label
        >
        <input
          v-model="titulaire"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le titulaire du compte"
        />
      </div>
      <div v-if="selectedPaymentMode === 'CHÈQUE' || selectedPaymentMode === 'DÉPÔT' " class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Numero du compte <span class="text-danger">*</span></label
        >
        <input
          v-model="compte_num"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le numero du compte"
        />
      </div>
      <div v-if="selectedPaymentMode === 'CHÈQUE' || selectedPaymentMode === 'DÉPÔT' " class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Ajouter un fichier<span class="text-danger">*</span></label
        >
        <input
          
          id="pos-form-3"
          type="file"
          class="form-control flex-1"
          placeholder="Entrez le numero du compte"
        />
      </div>
      <div class="col-span-12">
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >Mot de passe<span class="text-danger">*</span></label
        >
        <input
          v-model="password"
          id="pos-form-3"
          type="password"
          class="form-control flex-1"
          placeholder="Entrez le mot de passe"
        />
      </div>
    </ModalBody>
    <ModalFooter class="text-right">
      <button
        type="button"
        @click="newOrderModal = false"
        class="btn btn-danger w-32 mr-1"
      >
        Fermer
      </button>
      <button type="button" class="btn btn-primary w-32" @click="setCheque">Enregistrer</button>
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
      showMyself: false,
      selectedPaymentMode: "",
      selectedBank: "",
      typePaymentMode: "",
      typePselectedPaymentMode: "",
      listBank: [],
      listPaymentMode: [
        { id: "1", libelle: "MOMO ", ischecked: false },
        { id: "2", libelle: "CHÈQUE", ischecked: false },
        { id: "3", libelle: "VIREMENT", ischecked: false },
        { id: "4", libelle: "DÉPÔT", ischecked: false },
        { id: "5", libelle: "GAIN", ischecked: false },
      ],
      solde: { solde: "", gain: "", last_transaction: "" },
      listChargementMoney: [],
      page: 1,
      isLoading: false,
      fullPage: true,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
      enterpageno: "",
      search: "",
      swift_code:"",
      borderau_num:"",
      montant:"",
      nom_deposant:"",
      transac_num: "",
      cheque:"",
      date_remise : "",
      titulaire : "",
      compte_num:"",
      fichier:"",
      password:""
    };
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getChargementMoney();
  },

  created() {
    document.title =
      "Chargement compte | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    newCompte(nom) {
      this.getAllBank();
      this.newOrderModal = true;
      this.title = nom;
    },

    getAllBank() {
      axios
        .get(`${Config.BASE_URL}money/getAllBank`)
        .then((response) => {
          console.log(response);
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

    // //MOMO
    // registerMomo(){
    //   const data = {
    //     mode_paiement: 2,
    //     numero_trans: this.transac_num,
    //     password: this.password,
    //     user_id: this.user.id
    //   }
    //   axios.post(`${Config.BASE_URL}money/register_paiement_momo`, data)
    //     .then(response =>{
    //       console.log(response);
    //     })
    // }

    //CHEQUE

    setCheque(){

      const data = {
        numero_trans: this.transac_num,
        montant: this.montant,
        mode_paiement: 3,
        password: this.password,
        date_remise: this.date_remise,
        titulaire: this.titulaire,
        numero_compte: this.compte_num,
        banque: 1,
        user_id: 241,
      };

      axios.post(`${Config.BASE_URL}money/save_reference.php`, data)
        .then(resp =>{
          console.log('cheque');
        })
        .catch(err =>{
          console.log(err);
        })
    },

    getChargementMoney() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}money/getAllReferencePaiementByclient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          console.log(response);
          this.isLoading = false;
          this.listChargementMoney = [...response.data.list];
          this.solde.solde = response.data.infocompte.solde;
          this.solde.gain = response.data.infocompte.gain;
          this.solde.last_transaction =
            response.data.infocompte.last_transaction;
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

    onPageChange(page) {
      this.page = page;
      this.getChargementMoney();
    },

    exportExcel() {
      saveExcel({
        data: this.listChargementMoney,
        fileName: "Mes_Chargement_CompteMoney",
        columns: [
          { field: "telephone", title: "Date" },
          { field: "solde", title: "Reférence Paiement" },
          { field: "solde_data", title: "Montant" },
          { field: "operateur", title: "Mode paiement" },
          { field: "gain", title: "Etat" },
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
