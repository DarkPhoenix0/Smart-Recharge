<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Chargement en masse flotte Airtime</h2>
    <div class="text-right font-bold text-2xl">
      Solde Airtime <u>{{ solde.airtime }} FCFA</u>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <div
        class="col-span-12 sm:col-span-12"
      >
          <a href="/model/model_chargement_portefeuille_airtime.xlsx">
            <button class="btn btn-dark shadow-md mr-2">
                <i class="fa fa-download"></i>&nbsp; Télécharger le modèle
            </button>
          </a>
          <input
          class="mr-2"
            type="file"
            @change="fileToJson"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <button v-on:click="verifier"
          class="btn btn-primary shadow-md">
          <i class="fas fa-refresh"></i>&nbsp; Vérifier
        </button>
      </div>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--        Showing 1 to 10 of 150 entries-->
      </div>
      <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
        <div class="w-65 relative text-slate-500">
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
            <th>BÉNÉFICIAIRE </th>
            <th>EMAIL</th>
            <th>OPÉRATEUR</th>
            <th>MONTANT</th>
            <th>RAPPORT D'INTÉGRITÉ DU FICHIER</th>
          </tr>
        </thead>
        <tbody>
          <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listChargeAirtime.length">Aucune donnée disponible</div>
          </tr>
          <tr
             v-for="(airtime, airtimeKey) in filteredListAirtimeFile"
            :key="airtimeKey"
            class=""
          >
            <td v-html="highlightMatches(airtime?.beneficiaire)" class="w-60 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.operateur)" class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.numero)" class="w-40 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.valeur)" class="w-20 border border-slate-300" 
                ></td>
            <td v-html="highlightMatches(airtime?.message)" class="w-60 border border-slate-300" 
                ></td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-10">
        <div class="text-right font-bold text-2xl mr-2">   
            Montant à recharger (TTC): <u>{{ this.somme }} FCFA</u>
        </div>
        <button @click="creerFlotteAirtime" class="btn btn-primary shadow-md ml-2">
            Valider
        </button>
      </div>
    </div>
    </div>
    <!-- END: Data List -->
</template>

<script>
import { ref } from "vue";
import Loading from "vue-loading-overlay";
import axios from "axios";
import Pagination from "@/components/pagination/Main.vue";
import Config from "../../config.json";
import "vue-loading-overlay/dist/vue-loading.css";
import XLSX from "xlsx/dist/xlsx.full.min.js";


export default {
  components: {
    Loading,
    Pagination,
  },
  data: function () {
    return {
      title: "",
      label: "",
      somme: 0,
      chargeAirtime: {
        file: null,
        data: [],
      },
      listChargeAirtime: [],
      solde: {'airtime': ''},
    };
  },

   computed: {

    filteredListAirtimeFile() {
      return this.listChargeAirtime?.filter((row) => {
        const beneficiaire = row.beneficiaire?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const numero = row.numero?.toLowerCase();
        const valeur = row.valeur?.toLowerCase();
        const message = row.message?.toLowerCase();
        const searchTerm = this.search?.toLowerCase();

        return (
          beneficiaire?.includes(searchTerm) ||
          operateur?.includes(searchTerm) ||
          numero?.includes(searchTerm) ||
          valeur?.includes(searchTerm) ||
          message?.includes(searchTerm)
        );
      });
    },

    updateValue() {
      if (this.chargeAirtime.file) {
        this.chargeAirtime.data = this.chargeAirtime.file.map(element => parseInt(element.numero));
        this.chargeAirtime.data.forEach(s => {
          this.somme += s
        });
          console.log('res',  this.somme);
      }
    },
  },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
  },


  created() {
    document.title =
      "Chargement en masse flotte Airtime | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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
        this.chargeAirtime.file = data;
        const header = data;
      };
      reader.readAsBinaryString(file);
      console.log("fileTojson is :", file);
    },

    getSoldeGlobal() {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}parametres/getSoldeGlobalAirtime`)
        .then((response) => {
          this.isLoading = false;
          console.log("solde is :", response);
           this.solde.solde = response.data.valeur;
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

    creerFlotteAirtime() {
      this.isLoading = true;
      const data = {
        client_id: this.selectedUser,
        list_user: this.listFlotteMasse,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/createPortefeuilleMasse`, data)
        .then((response) => {
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
            this.toggleView();
            this.getAllUsers();
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

    verifier() {
      this.isLoading = true;
      const data = {
        masse: this.chargeAirtime.file,
        user_id: this.user.id,
      };
      axios
        .post(`${Config.BASE_URL}portefeuille/verifiePortefeuilleFile`, data)
        .then((response) => {
          console.log("verifier is :", response);
          this.listChargeAirtime = [...response.data.list]
          this.isLoading = false;
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else {
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
