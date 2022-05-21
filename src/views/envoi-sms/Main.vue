<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Gestion des SMS</h2>
    <div class="text-right font-bold text-2xl">
      Solde SMS <u>{{ solde.solde }}</u>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <button
        v-on:click="newSMS('nouveau', 'Formulaire SMS')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-comment"></i>&nbsp; Nouveau
      </button>
      <button
        v-on:click="newSMS('groupe', 'SMS Groupé')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-comments"></i>&nbsp; SMS groupé
      </button>
      <button
        v-on:click="newSMS('multiple', 'SMS Multiple')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-comments"></i>&nbsp; SMS multiple
      </button>
      <button
        v-on:click="newSMS('contact', 'Groupe de contact')"
        class="btn btn-primary shadow-md mr-2"
      >
        <i class="fa fa-folder"></i>&nbsp; Groupe de contact
      </button>
      <button @click="getAllSMS" class="btn btn-light shadow-md mr-2">
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
            <th>NUMÉRO</th>
            <th>MESSAGE</th>
            <th>CANAL</th>
            <th>ETAT</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-1xl">
            <div v-if="!listSMS.length">Aucune donnée disponible</div>
          </tr>
          <tr v-for="(sms, smsKey) in filteredListSMS" :key="smsKey">
            <td
              v-html="highlightMatches(sms.create_time)"
              class="w-60 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(sms.numero)"
              class="w-40 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(sms.message)"
              class="w-100 border border-slate-300"
            ></td>
            <td
              v-html="highlightMatches(sms.canal)"
              class="w-20 border border-slate-300"
            ></td>
            <td class="w-20 border border-slate-300">
              <div
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-red-600 rounded text-white text-dark-700': sms.etat === 'échoué',
                  'bg-green-500 rounded text-white': sms.etat === 'envoyé',
                }"
              >
                {{ sms.etat }}
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
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
      <div
        v-if="vue === 'groupe' || vue === 'multiple'"
        class="col-span-12 sm:col-span-12"
      >
        <div
          class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mb-4"
        >
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
      <div class="col-span-12"
       v-if="vue === 'contact'">
        <label for="contact" class="form-label">
          <b>Groupe de contact <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedGroupe"
          @change="selectGroupe()"
          :options="{
            placeholder: 'Selectionner le groupe',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Groupe de contact',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option v-for="(groupe, groupeKey) in listGroupe"
            :key="groupeKey" :value="groupe.id">
            {{ groupe.nom }}
          </option>
        </TomSelect>
      </div>
      <div class="col-span-12">
        <label for="numero" class="form-label">
          <b>Canal de transmission <span class="text-danger">*</span></b>
        </label>
        <TomSelect
          v-model="selectedCanal"
          :options="{
            placeholder: 'Selectionner le canal de transaction',
            closeAfterSelect: false,
            plugins: {
              dropdown_header: {
                title: 'Canal de transaction',
              },
            },
          }"
          class="w-full"
        >
          <option></option>
          <option v-for="(canal, canalKey) in listCanal"
            :key="canalKey" :value="canal.id">
            {{ canal.libelle }}
          </option>
        </TomSelect>
      </div>
      <div
        class="col-span-12 sm:col-span-12"
        v-if="vue === 'nouveau' "
      >
        <label for="numero" class="form-label">
          <b
            >{{
              vue === "nouveau"
                ? (label = "Numéro(s)")
                : vue === "groupe"
                ? (label = "Liste des numéros")
                : ""
            }} <span class="text-danger">*</span></b
          >
        </label>
        <input
          type="text"
          class="form-control"
          :disabled="vue === 'groupe'"
          v-model="envoiSMS.numero"
          placeholder="Entrez le(s) numéro.. utiliser ‘;’ pour plusieurs"
        />
      </div>
      <div v-if="vue === 'nouveau' || vue === 'groupe' || vue === 'contact'" class="col-span-12">
        <label for="numero" class="form-label">
          <b>Message {{ updateValue }}<span class="text-danger">*</span></b>
        </label>
        <textarea
          class="w-full form-control shadow-inner border-2"
          placeholder="Saisir le message.."
          rows="4"
          name="message"
          v-model="envoiSMS.message"
        >
        </textarea>
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
      <button type="button" 
      @click="vue === 'nouveau' || vue === 'groupe' || vue === 'contact' ? sendSMS() : sendSMSMultiple()" 
      class="btn btn-primary w-32">
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
import XLSX from "xlsx/dist/xlsx.full.min.js";
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
      selectedCanal: "",
      selectedGroupe: "",
      envoiSMS: {
        numero: null,
        message: null,
        file: null,
        numeroTab: [],
        data: [],
      },
      listGroupe: [],
      filterContact: [],
      smsMultiple: [],
      listCanal: [
        { id: "1", libelle: "API", ischecked: false },
        { id: "2", libelle: "SIM", ischecked: false },
      ],
      solde: { solde: "" },
      listSMS: [],
      listData: [],
      contactAll: [],
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
    filteredListSMS() {
      return this.listSMS.filter((row) => {
        const create_time = row.create_time?.toLowerCase();
        const numero = row.numero?.toLowerCase();
        const message = row.message?.toLowerCase();
        const canal = row.canal?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          create_time.includes(searchTerm) ||
          numero.includes(searchTerm) ||
          message.includes(searchTerm) ||
          canal.includes(searchTerm)
        );
      });
    },

    updateValue() {
      if (this.envoiSMS.numero) {
        this.envoiSMS.numeroTab = this.envoiSMS.numero.split(";");
          console.log('jhdf',this.envoiSMS.numeroTab);
      } 
      if (this.envoiSMS.file) {
        this.envoiSMS.data = this.envoiSMS.file.map(element => element.numero);
          console.log('envoiSMS',this.envoiSMS.data);
          this.envoiSMS.numeroTab = this.envoiSMS.data; 
          // this.envoiSMS.numeroTab = this.envoiSMS.file.map(numero => numero[0]);
          console.log('res',this.envoiSMS.numeroTab);
      }
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllSMS();
  },

  created() {
    document.title =
      "Gestion des SMS | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newSMS(type, nom) {
      if (type === "nouveau") {
        this.newOrderModal = true;
        console.log("type is :", type);
        this.vue = type;
        this.title = nom;
      } else if (type === "groupe") {
        this.newOrderModal = true;
        console.log("type is :", type);
        this.vue = type;
        this.title = nom;
      } else if (type === "contact") {
        this.newOrderModal = true;
        this.getAllGroupe();
        console.log("type is :", type);
        this.vue = type;
        this.title = nom;
      } else {
        console.log("type is :", type);
        this.newOrderModal = true;
        this.title = nom;
        this.vue = type;
      }
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedCanal = "";
      this.envoiSMS = {};
      this.envoiSMS.numero = "";
    },

    selectGroupe(event){
      const filterSelected = this.listGroupe.find(element => element.id == this.selectedGroupe);
      console.log("filterSelected is :",filterSelected);
      filterSelected?.contacts?.filter(element => this.filterContact.push(element.numero));
      console.log("filterContact is :", this.filterContact);
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
        const data = XLSX.utils.sheet_to_json(ws, { header:0 } );
        /* Update state */
        this.data = data;
        console.log('data is',data);
        this.envoiSMS.file = data;
        const header = data;
        // this.envoiSMS.file.forEach(element => {
        // this.listData.push({"nom": element.NOM,"numero": element.NUMERO})
        // });
        // console.log(this.listData);
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    sendSMSMultiple() {
      this.isLoading = true;
      const data = {
        canal: this.selectedCanal,
        diffusion: this.envoiSMS.file,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}services/sendSMSMultiple`, data)
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
            this.getAllSMS();
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

    sendSMS() {
      this.isLoading = true;
      const data = {
        canal: this.selectedCanal,
        message: this.envoiSMS.message,
        user_id: this.user.id,
        ...(this.vue === "nouveau"
          ? { list_numero: this.envoiSMS.numeroTab }
          : {}),
        ...(this.vue === "groupe" ? { list_numero: this.envoiSMS.data } : {}),
        ...(this.vue === "contact"
          ? {
              list_numero: this.filterContact,
            }
          : {}),
      };
      let url;
      if (this.vue === "nouveau") {
        url = "services/sendSmsGroupe";
      } else if (this.vue === "groupe") {
        url = "services/sendSmsGroupe";
      } else if (this.vue === "contact") {
        url = "services/sendSmsGroupe";
      } else {
        url = "services/sendSMSMultiple";
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
            this.getAllSMS();
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

     getAllGroupe() {
      axios
        .get(
          `${Config.BASE_URL}contact/getAllGroupeContact`
        )
        .then((response) => {
          console.log("benef is :", response);
          this.listGroupe = [...response.data];
          this.contactAll = this.listGroupe.contacts;
        })
        .catch((error) => {
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },

    getAllSMS() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}services/getAllSMS/${this.page}`)
        .then((response) => {
          this.isLoading = false;
          this.listSMS = [...response.data.data];
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

    onPageChange(page) {
      this.page = page;
      this.getAllSMS();
    },

    exportExcel() {
      saveExcel({
        data: this.listSMS,
        fileName: "Gestion_SMS",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "numero", title: "Numéro" },
          { field: "message", title: "Message" },
          { field: "canal", title: "Canal" },
          { field: "etat", title: "Etat" },
        ],
      });
    },
  },
};
</script>

<style scoped>
</style>
