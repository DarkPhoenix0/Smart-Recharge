<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <!-- <h2 class="text-lg font-medium mt-10">Liste des dotations</h2> -->
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Dotation Mensuelle</h2>
    <div class="text-right font-bold text-2xl">
      Solde compte <u>FCFA</u> | Airtime <u>FCFA</u> | Data <u>GB</u> | SMS <u></u> 
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
      <button v-on:click="newDotation('Choix du service')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fas fa-add"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllChargementDirect" class="btn btn-light shadow-md mr-2">
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
            <th>DATE CRÉATION</th>
            <th>RÉFÉRENCE</th>
            <th>SERVICE</th>
            <th>VALEUR</th>
            <th>MONTANT TTC (FCFA)</th>
            <th>EMETTEUR</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center" v-if="!listInfoCompte.length" >
             <td colspan="6">
                <div class="justify-content-center text-2xl">
                  <b>Aucune donnée disponible</b>
                </div>
             </td>
          </tr>
          <tr
            v-for="(infocompte, infocompteKey) in listInfoCompte"
            :key="infocompteKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.telephone }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.telephone }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.solde }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.solde_data }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.operateur }}</span>
            </td>
            <td class="w-40 border border-slate-300">
              <span v-if="infocompte">{{ infocompte.gain }}</span>
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
        <label for="pos-form-1" class="text-xs font-bold mb-2">Type service <span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedTypeService"
          :options="{
            placeholder: 'Selectionner le type de service',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Type de service',
              },
            },
          }"
          class="w-full"
        >
        <option></option>
          <option
            v-for="(service, serviceKey) in listTypeService"
            :value="service.sigle"
          >
            {{ service.libelle }}
          </option>
        </TomSelect>
      </div>
       <div
       v-show="selectedTypeService === 'AIRTIME' || selectedTypeService === 'DATA' || selectedTypeService === 'SMS'"
        v-if="selectedTypeService === 'AIRTIME' ? this.label = 'Montant (fcfa)'
        : selectedTypeService === 'DATA' ? this.label = 'Volume DATA (GB)'
        : selectedTypeService === 'SMS' ? this.label = 'Nombre'
        : '' "
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >{{label}} <span class="text-danger">*</span></label
        >
        <number
          name="montant"
          class="form-control"
          placeholder="Ex: 10 000"
          v-model="listInfoCompte"
          v-bind="number"
        >
        </number>
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
      <button type="button" class="btn btn-primary w-32">Enregistrer</button>
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
      label: "",
      selectedTypeService: "",
      listFlotte: [],
      listTypeService: [
        { id: "0", libelle: "DATA", ischecked: false },
        { id: "1", libelle: "AIRTIME", ischecked: false },
        { id: "2", libelle: "SMS", ischecked: false },
      ],
      solde: {'solde': ''},
      listInfoCompte: [],
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

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllChargementDirect();
  },


  created() {
    document.title =
      "Dotation mensuelle | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
  },
  methods: {
    newDotation(nom) {
      this.newOrderModal = true
      this.title = nom;
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedTypeService = ""
    },

    getAllBeneficiaire() {
      axios
        .get(
          `${Config.BASE_URL}money/getAllBeneficiaire`
        )
        .then((response) => {
          this.listFlotte = [...response.data];
          console.log(this.listFlotte);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllChargementDirect() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllChargementDirect/${this.user.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listInfoCompte = [...response.data.data];
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

    onPageChange(page) {
      this.page = page;
      this.getAllChargementDirect();
    },

    exportExcel() {
      saveExcel({
        data: this.listInfoCompte,
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
