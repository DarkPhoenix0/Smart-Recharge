<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Dotation Mensuelle clients</h2>
    <div class="text-right font-bold text-2xl">
       Solde compte <u>{{ solde.solde_compte }} FCFA</u> | Airtime
      <u>{{ solde.solde_airtime }} FCFA</u>| DATA <u>{{ solde.solde_data }} GB</u> | SMS <u>{{ solde.data }} </u>
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
      <button v-on:click="newDotation('nouveau','Formulaire de creation de dotation')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-add"></i>&nbsp; Nouveau
      </button>
      <button v-on:click="newDotation('airtime','Dotation Mensuelle Airtime')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-globe"></i>&nbsp;  Dotation airtime en masse
      </button>
      <button v-on:click="newDotation('data','Dotation Mensuelle Data')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fa fa-mobile"></i>&nbsp;  Dotation data en masse
      </button>
      <button @click="getAllDotMensuelleClt" class="btn btn-light shadow-md mr-2">
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
            <th>BÉNÉFICIAIRE</th>
            <th>EMAIL</th>
            <th>SERVICE</th>
            <th>VALEUR</th>
            <th>DATE EFFET</th>
            <th>DERNIÈRE UTILISATION</th>
            <th>ETAT</th>
            <th>SOLDE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listDotationMensuelleClt.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(dotationclt, dotationcltKey) in filteredListDotationMensuelle"
            :key="dotationcltKey"
            class=""
          >
            <td v-html="highlightMatches(dotationclt.create_time)" 
            class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.beneficiaire)" 
            class="w-80 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.email)" 
            class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.service)" 
            class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.valeur)" 
            class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.date_effet)" 
            class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(dotationclt.derniere_utilisation)" 
            class="w-60 border border-slate-300" 
                ></td>
            <td class="w-20 border border-slate-300" >
              <div
                class="flex items-center justify-center"

                :class="{
                  'bg-red-400 rounded text-dark-700':
                    dotationclt.etat === 'échoué',
                  'bg-green-500 rounded text-white':
                    dotationclt.etat === 'envoyé',
                }"
              >
                {{ dotationclt.etat }}
              </div>
            </td>
            <td v-html="highlightMatches(dotationclt.solde)" 
            class="w-40 border border-slate-300" 
                ></td>
            <td class="w-40 border border-slate-300">
          <button
            class="btn btn-dark shadow-md mr-2"
            @click="newDotation('edit', 'Modification dotations', dotationclt)"
          >
            <i class="fas fa-edit"></i>&nbsp;Charger
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
       <b class="text-2xl">{{title}}</b>
      <!-- <h2 class="font-medium text-base mr-auto">Transférer flotte</h2> -->
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div v-if="vue === 'airtime' || vue === 'data'"
        class="col-span-12 sm:col-span-12"
      >
      <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
        <button v-on:click="charger"
          class="btn btn-success shadow-md mr-2">
          <i class="fas fa-check"></i>&nbsp; Vérifier
        </button>
          <a href="/model/model_sms_groupe.xlsx">
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
      <div v-if="vue === 'nouveau'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Bénéficiaire<span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedRecipient"
          :options="{
            placeholder: 'Selectionner le bénéficiaire',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Bénéficiaire',
              },
            },
          }"
          class="w-full"
        >
        <option value=""></option>
          <option
            v-for="(recipient, recipientKey) in listRecipient"
            :key="recipientKey" :value="recipient.id"
          >
            {{ recipient.nom }} {{ recipient.prenom }} | {{ recipient.email }} | {{ recipient.contact }}
          </option>
        </TomSelect>
      </div>
      <div v-if="vue === 'nouveau'" class="col-span-12">
        <label for="pos-form-1" class="text-xs font-bold mb-2">Type service<span class="text-danger">*</span></label>
        <TomSelect
          v-model="selectedService"
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
          <option
            v-for="(service, serviceKey) in listService"
            :key="serviceKey" :value="service.libelle"
          >
            {{ service.libelle }}
          </option>
        </TomSelect>
      </div>
      <div
        v-if="selectedService === 'DATA' || selectedService === 'AIRTIME'"
        class="col-span-12"
      >
        <label for="pos-form-3" class="text-xs font-bold mb-2"
          >{{selectedService === 'DATA' ? label = 'Volume DATA' 
          : selectedService === 'AIRTIME' ? label = "Montant" 
          : label = "" }} <span class="text-danger">*</span></label
        >
        <number
          name="montant"
          class="form-control"
          placeholder="Ex: 10 000"
          v-model="chargerDotation.montant"
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
      <button type="button"
      @click="dotationMensuelleClt"
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
      label: "",
      vue: "",
      dotationMensuelleClt: {
        file: null,
        montant: null,
      },
      selectedService : "",
      selectedRecipient : "",
      listService: [
        { id: "0", libelle: "DATA", ischecked: false },
        { id: "1", libelle: "AIRTIME", ischecked: false },
      ],
      solde: {'solde_compte': '','solde_airtime': '','solde_data': '','solde_sms': '',},
      listRecipient: [],
      listDotationMensuelleClt: [],
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

    filteredListDotationMensuelle() {
      return this.listDotationMensuelleClt?.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const beneficiaire = row.beneficiaire?.toLowerCase();
        const email = row.email?.toLowerCase();
        const service = row.service?.toLowerCase();
        const valeur = row.valeur?.toLowerCase();
        const date_effet = row.date_effet?.toLowerCase();
        const derniere_utilisation = row.derniere_utilisation?.toLowerCase();
        const etat = row.etat?.toLowerCase();
        const solde = row.solde?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          beneficiaire.includes(searchTerm) ||
          email.includes(searchTerm) ||
          service.includes(searchTerm) ||
          valeur.includes(searchTerm) ||
          date_effet.includes(searchTerm) ||
          derniere_utilisation.includes(searchTerm) ||
          etat.includes(searchTerm) ||
          solde.includes(searchTerm)
        );
      });
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllDotMensuelleClt();
  },


  created() {
    document.title =
      "Dotation Mensuelle clients | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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
    
    newDotation(type, nom) {
      this.getAllBeneficiaire();
     if (type === 'nouveau') {
       this.newOrderModal = true
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
     } else if (type === 'data') {
       this.newOrderModal = true
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
     } else {
       console.log('type is :', type)
       this.newOrderModal = true
       this.title = nom;
       this.vue = type
     }
    },

    closeModal() {
      this.newOrderModal = false;
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
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        /* Update state */
        this.data = data;
        console.log('data is',data);
        this.dotationMensuelleClt.file = data;
        const header = data.shift();
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    getAllBeneficiaire() {
      axios
        .get(
          `${Config.BASE_URL}login/getAllUserClient`
        )
        .then((response) => {
           console.log('beneficiaire is',response)
          this.listRecipient = [...response.data];
          console.log(this.listRecipient);
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    dotationMensuelleClt() {
      this.isLoading = true;
      const data = {
        canal: this.selectedTypeCanal,
        message: this.envoiSMS.message,
        user_id: this.user.id,
      };
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
            this.getAllDotMensuelleClt();
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

    getAllDotMensuelleClt() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}dotation/getAllDotationPonctuelleClient/${this.page}`
        )
        .then((response) => {
          console.log('dotation is :', response)
          this.isLoading = false;
          this.listDotationMensuelleClt = [...response.data];
          this.solde.solde_compte = response.data.solde_compte;
          this.solde.solde_airtime = response.data.solde_airtime;
          this.solde.solde_data = response.data.solde_data;
          this.solde.solde_sms = response.data.solde_sms;
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
      this.getAllDotMensuelleClt();
    },

    exportExcel() {
      saveExcel({
        data: this.listDotationMensuelleClt,
        fileName: "Dotations_ponctuelles_clientes",
        columns: [
          { field: "create_time", title: "Date création" },
          { field: "beneficiaire", title: "Bénéficiaire" },
          { field: "email", title: "Email" },
          { field: "service", title: "Service" },
          { field: "valeur", title: "Valeur" },
          { field: "date_effet", title: "Date effet" },
          { field: "derniere_utilisation", title: "Dernière utilisation" },
          { field: "etat", title: "Etat" },
          { field: "solde", title: "Solde" },
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
