<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <h2 class="text-2xl font-medium mt-10" v-if="viewListTransactions">
    <b>Liste des transactions</b>
  </h2>
    <modal name="hello-world">
    <center><p>The Rich Post</p></center>
    </modal>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewListTransactions">
    <div class="col-span-12 flex flex-wrap sm:flex-nowrap items-center mt-2">
      <button @click="toggleView" class="btn btn-primary shadow-md mr-2">
        Acheter
      </button>
      <button @click="exportExcel" class="btn btn-dark shadow-md mr-2">
        <i class="fas fa-file-excel"></i>&nbsp;Exporter
      </button>
      <button @click="getAllTransactions" class="btn btn-light shadow-md mr-2">
        <i class="fas fa-refresh"></i>&nbsp;Rafraichir
      </button>
      <div class="hidden md:block mx-auto text-slate-500">
        <!--        Showing 1 to 10 of 150 entries-->
      </div>
      <div class="w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto md:ml-0">
        <div class="w-56 relative text-slate-500">
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
      <table class="table table-report -mt-2">
        <thead>
          <tr>
            <th class="whitespace-nowrap">DATE</th>
            <th class="whitespace-nowrap">SERVICE</th>
            <th class="whitespace-nowrap">COUT (FCFA)</th>
            <th class="whitespace-nowrap">BENEFICIAIRE</th>
            <th class="whitespace-nowrap">FLOTTE</th>
            <th class="whitespace-nowrap">ETAT</th>
            <th class="whitespace-nowrap">INITIATEUR</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(transaction, transactionKey) in filteredListTransactions"
            :key="transactionKey"
          >
            <td
              v-html="highlightMatches(transaction.create_time)"
              class="w-40"
            ></td>
            <td
              v-html="highlightMatches(transaction.service)"
              class="w-40"
            ></td>
            <td v-html="highlightMatches(transaction.cout)" class="w-20"></td>
            <td
              v-html="highlightMatches(transaction.telephone)"
              class="w-40"
            ></td>
            <td
              class="w-40"
              v-html="highlightMatches(transaction.operateur)"
            ></td>
            <td class="w-20">
              <div
                class="flex items-center justify-center"
                :style="{ width: '85px' }"
                :class="{
                  'bg-yellow-400 rounded text-dark-700':
                    transaction.etat === 'en attente',
                  'bg-green-500 rounded text-white':
                    transaction.etat === 'traité',
                }"
              >
                {{ transaction.etat }}
              </div>
            </td>
            <td
              v-html="highlightMatches(transaction.emetteur)"
              class="w-40"
            ></td>
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
  <!-- BEGIN: Rapport -->

  <!-- END: Rapport -->
  <div class="flex items-center mt-8" v-if="viewBuyService">
    <h2 class="text-2xl font-medium mr-auto">
      <b>Formulaire d'achat</b>
    </h2>
    <div class="text-right">
      <button
        @click="toggleView"
        type="button"
        class="btn btn-danger w-24 mr-1"
      >
        Fermer
      </button>
    </div>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5" v-if="viewBuyService">
    <div class="col-span-6 lg:col-span-12">
      <!-- BEGIN: Form Layout -->
      <div class="box p-5">
        <div class="grid grid-cols-12 gap-6">
          <!-- BEGIN: Field 1  -->
          <div class="col-span-6 lg:col-span-4">
            <fieldset :style="{ height: '135px' }">
              <legend>
                <b class="text-2xl">Services</b>
              </legend>
              <div
                class="flex flex-col sm:flex-row mt-2"
                :style="{ 'margin-top': '2.8%' }"
              >
                <div
                  class="form-check mr-10"
                  v-for="(service, serviceKey) in listService"
                  :key="serviceKey"
                >
                  <input
                    class="form-check-input"
                    type="radio"
                    name="service"
                    :id="service.id"
                    :value="service.libelle"
                    @change="onSelectService($event)"
                    :style="{ width: '25px', height: '25px' }"
                  />
                  <label class="form-check-label" :for="service.id">
                    {{ service.libelle }}
                  </label>
                </div>
              </div>
              <br />
            </fieldset>
          </div>
          <!-- END: Field 1  -->
          <!-- BEGIN: Field 2  -->
          <div class="col-span-6 lg:col-span-8">
            <fieldset>
              <legend>
                <b class="text-2xl">Opérateurs</b>
              </legend>
              <div class="flex flex-col sm:flex-row mt-2">
                <div
                  class="form-check"
                  :class="achatData.service === 'Money' ? '' : ' mr-6'"
                  v-for="(wallet, walletKey) in listWallet"
                  :key="walletKey"
                >
                  <input
                    v-if="
                      achatData.service !== 'Money' &&
                      wallet.operateur !== 'MONEY'
                    "
                    class="form-check-input"
                    type="radio"
                    name="flotte"
                    @change="onSelectWallet(wallet)"
                    :style="{ width: '25px', height: '25px' }"
                  />
                  &nbsp;&nbsp;
                  <img
                    v-if="
                      wallet.operateur === 'MOOV' &&
                      achatData.service !== 'Money'
                    "
                    src="@/assets/images/services/logo_moov.png"
                    width="48"
                    alt="Illustration Operateur Moov"
                  />
                  <img
                    v-if="
                      wallet.operateur === 'ORANGE' &&
                      achatData.service !== 'Money'
                    "
                    src="@/assets/images/services/logo_orange.png"
                    width="48"
                    alt="Illustration Operateur Orange"
                  />
                  <img
                    v-if="
                      wallet.operateur === 'MTN' &&
                      achatData.service !== 'Money'
                    "
                    src="@/assets/images/services/logo_mtn.jpg"
                    width="48"
                    alt="Illustration Operateur Mtn"
                  />
                  <img
                    v-if="
                      wallet.operateur === 'MONEY' &&
                      achatData.service === 'Money'
                    "
                    src="@/assets/images/services/money.png"
                    width="48"
                    alt="Illustration Operateur MONEY"
                  />
                  <label
                    v-if="
                      wallet.operateur !== 'MONEY' &&
                      achatData.service !== 'Money'
                    "
                    class="form-check-label"
                    for="wallet"
                  >
                    {{ wallet.operateur }} <b>({{ wallet.solde }} F)</b>
                  </label>
                  <label
                    v-if="
                      wallet.operateur === 'MONEY' &&
                      achatData.service === 'Money'
                    "
                    class="form-check-label"
                    for="wallet"
                  >
                    {{ wallet.operateur }} <b>({{ wallet.solde }} F)</b>
                  </label>
                </div>
              </div>
              <br />
            </fieldset>
          </div>
          <!-- END: Field 2 -->
        </div>
        <br />
        <!-- BEGIN: Field 3  -->
        <div>
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-6 lg:col-span-7">
              <fieldset>
                <legend>
                  <b class="text-2xl">Bénéficiaire</b>
                </legend>
                <div class="flex flex-col sm:flex-row mt-2">
                  <div class="form-check mr-10">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="beneficiaire"
                      @change="onSelectBac($event)"
                      :style="{ width: '25px', height: '25px' }"
                      value="beneficiaire"
                    />
                    <label class="form-check-label" for="beneficiaire-enregistre">
                      Béneficiaire enregistré
                    </label>
                  </div>
                  &nbsp;
                  <div class="form-check mr-10 mt-2 sm:mt-0">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="beneficiaire"
                      @change="onSelectBac($event)"
                      :style="{ width: '25px', height: '25px' }"
                      value="numero"
                    />
                    <label class="form-check-label" for="numero-fourni"
                      >Numéro fourni</label
                    >
                  </div>
                  &nbsp;
                  <div class="form-check mr-10 mt-2 sm:mt-0" v-if="!showMyself">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="beneficiaire"
                      @change="onSelectBac($event)"
                      :style="{ width: '25px', height: '25px' }"
                      value="myself"
                    />
                    <label class="form-check-label" for="numero-fourni"
                      >Moi-même {{achatData.telephone}}</label
                    >
                  </div>
                </div>
                <br />
                <!-- BEGIN: Input Numero -->
                <div
                  class="col-span-12 sm:col-span-12"
                  v-if="recipientType === 'numero'"
                >
                  <label for="numero_telephone" class="form-label">
                    <b>Télephone <span class="text-danger">*</span></b>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="achatData.numero"
                    v-mask="'## ## ## ## ##'"
                    v-bind:placeholder="placeholder"
                  />
                </div>
                <!-- END: Input Numero -->
                <!-- BEGIN: Recipient List -->
                <div
                  class="col-span-12 overflow-auto lg:overflow-visible"
                  v-if="recipientType === 'beneficiaire'"
                >
                  <label for="numero_telephone" class="form-label">
                    <b
                      >Liste des béneficiaires <span class="text-danger">*</span></b
                    >
                  </label>
                  <TomSelect
                    v-model="selectedRecipient"
                    :options="{
                      placeholder: 'Selectionner votre béneficiaire',
                      closeAfterSelect: false,
                      plugins: {
                        dropdown_header: {
                          title: 'Béneficiaire',
                        },
                      },
                    }"
                    class="w-full"
                    multiple
                  >
                    <!-- <option value="">--</option> -->
                    <option
                      v-for="(recipient, recipientKey) in listRecipient"
                      :value="recipient.numero"
                    >
                      {{ recipient.nom }} {{ recipient.prenom }} ({{
                        recipient.telephone
                      }})
                    </option>
                  </TomSelect>
                </div>
                <!-- END: Recipient List -->
                <br
                  v-if="
                    achatData.service === 'MIX' &&
                    (recipientType === 'beneficiaire' || recipientType === 'numero')
                  "
                />
               
                <!-- END: Recipient List -->
              </fieldset>
            </div>
            <!-- <br /> -->
            <!-- BEGIN: Input Montant -->
            <div class="col-span-6 lg:col-span-5 pt-5"
              :style="{ height: '100px' }">
              <!-- <fieldset  -->
                <div
                  class="col-span-6 lg:col-span-6"
                  :class="achatData.service === 'Crédit' || achatData.service === 'Money' ? 'border p-4 border-sky-900 rounded-2xl h-25' 
                  : achatData.service === 'Money' && (this.RecipientType === 'numero' || this.RecipientType === 'beneficiaire') ? 'border p-3 border-sky-900 rounded-2xl h-36'
                  : ''"
                  v-if="
                    this.achatData.service === 'Crédit' ||
                    this.achatData.service === 'Money'
                  "
                >
                  <label for="montant" class="form-label">
                    <b>Montant (FCFA)<span class="text-danger">*</span></b>
                  </label>
                  <number
                    name="montant"
                    :disabled="!achatData.beneficiaire"
                    class="form-control"
                    placeholder="Ex: 10 000"
                    v-model="achatData.montant"
                    v-bind="number"
                  >
                  </number>
               <!--BEGIN: Frais  -->
                 <div v-if="achatData.service === 'Money' && (recipientType === 'beneficiaire' || recipientType === 'numero')"
                :style="{ 'margin-top': '1%', 'margin-bottom': '2%' }"
              >
                <span class="text-sm">Souhaitez-vous payer les frais ?</span>
              <div
                class="flex flex-col sm:flex-row mt-2"
                :style="{ 'margin-top': '1%', 'margin-bottom': '2%' }"
              >
                <div
                  class="form-check mr-10"
                  v-for="(frais, fraisKey) in fraisData"
                  :key="fraisKey"
                >
                  <input
                    class="form-check-input"
                    type="radio"
                    name="frais"
                    :disabled="!achatData.montant"
                    :value="frais.ischecked"
                    :id="frais.id"
                    @change="onSelectFrais($event)"
                    :style="{ width: '25px', height: '25px' }"
                  />
                  <label class="form-check-label" :for="frais.id">
                    {{ frais.libelle }}
                  </label>
                </div>
              </div>
              </div>
             <!--END: Frais  -->
                </div>
              <!-- </fieldset> -->
               <!-- BEGIN: Mix List -->
                <div
                 class="col-span-6 lg:col-span-6"
                 :class="achatData.service === 'MIX' ||  this.RecipientType === 'myself' ? 'border p-4 border-sky-900 rounded-2xl h-25' 
                 :achatData.service === 'MIX' && this.RecipientType === 'beneficiaire'? 'border p-3 border-sky-900 rounded-2xl h-36' : ''"
                  v-if="achatData.service === 'MIX'"
                >
                  <label for="numero_telephone" class="form-label">
                    <b>Service MIX<span class="text-danger">*</span></b>
                  </label>
                  <TomSelect
                    v-model="selectedServiceMix"
                    :options="{
                      placeholder: 'Selectionner le service',
                      plugins: {
                        dropdown_header: {
                          title: 'Service disponible',
                        },
                      },
                    }"
                    class="w-full"
                  >
                    <option value="">--</option>
                    <option v-for="(mix, mixKey) in listServiceMix" :value="mix.id">
                      {{ mix.libelle }} ({{ mix.valeur }} FCFA)
                    </option>
                  </TomSelect>
                </div>
            </div>
          </div>
          <!-- END: Input Montant -->
          <br />
            <div v-if="achatData.service === 'Money'">
              <label for="commentaire" class="form-label">
                <b>Commentaire <span class="text-danger">*</span></b> </label
              >
              <br />
              <textarea
                class="w-1/2 form-control shadow-inner text-2xl p-4 border-2"
                placeholder="Laisser un commentaire.."
                rows="2"
                name="montant"
                :disabled="!achatData.frais"
                v-model="achatData.commentaire"
              >
              </textarea>
            </div>
        </div>
        <!-- END: Field 3 -->
        <div class="mt-5">
          <button
            @click="buyAirtime"
            :disabled="!achatData.beneficiaire"
            type="button"
            class="btn btn-primary"
          >
            Enregistrer
          </button>
          &nbsp;
          <button @click="toggleView" type="button" class="btn btn-danger mr-1">
            Annuler
          </button>
        </div>
      </div>
      <!-- END: Form Layout -->
    </div>
  </div>
  <!-- <div >
    <button @click="$refs.modalName.openModal()">Open modal</button>

    <h1>TABLEAU DES RAPPORTS</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incid</p>

    <modal ref="modalName">
      <template v-slot:header>
        <h1>Modal title</h1>
      </template>

      <template v-slot:body>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nunc sed velit dignissim sodales ut eu sem integer vitae. Id aliquet lectus proin nibh nisl condimentum. Fringilla urna porttitor rhoncus dolor purus. Nam aliquam sem et tortor. Nisl vel pretium lectus quam id. Cras pulvinar mattis nunc sed. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat orci. Tristique magna sit amet purus. Fermentum et sollicitudin ac orci phasellus egestas tellus. Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan. Felis eget nunc lobortis mattis aliquam faucibus. Tincidunt eget nullam non nisi est sit amet facilisis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Eget nunc scelerisque viverra mauris in aliquam sem fringilla ut. Nec nam aliquam sem et tortor consequat id. Commodo nulla facilisi nullam vehicula ipsum a. Elementum tempus egestas sed sed. Faucibus purus in massa tempor nec feugiat nisl pretium fusce.</p>
        <p>Arcu cursus vitae congue mauris rhoncus aenean. Tempor id eu nisl nunc mi. Pharetra diam sit amet nisl suscipit adipiscing bibendum. Ut faucibus pulvinar elementum integer enim. Odio facilisis mauris sit amet massa vitae tortor condimentum lacinia. Eu non diam phasellus vestibulum lorem sed risus. Porttitor rhoncus dolor purus non enim praesent. Sit amet mauris commodo quis imperdiet. Lobortis feugiat vivamus at augue eget. Nibh tellus molestie nunc non blandit. Tellus mauris a diam maecenas sed enim ut. Tortor aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Mattis aliquam faucibus purus in massa.</p>
      </template>

      <template v-slot:footer>
        <div>
          <button @click="$refs.modalName.closeModal()">Cancel</button>
          <button @click="$refs.modalName.closeModal()">Save</button>
        </div>
      </template>
    </modal>
  </div> -->
</template>

<script>
import Loading from "vue-loading-overlay";
import axios from "axios";
import Pagination from "@/components/pagination/Main.vue";
import Rapport from "@/views/rapport/Main.vue";
// import  { EventBus }  from './../eventbus';
// import ModalRoot from "@/views/ModalRoot.vue";
// import Modal from "@/common/Modal";
import Config from "../../config.json";
import "vue-loading-overlay/dist/vue-loading.css";
import { saveExcel } from "@progress/kendo-vue-excel-export";

export default {
  components: {
    Loading,
    Pagination,
    // ModalRoot,
    // Modal,
    Rapport,
  },
  data: function () {
    return {
      // isRapportVisible: false,
      showMyself: false,
      selectedRecipient: "",
      selectedServiceMix: "",
      idOperateur: null,
      idPortefeuille: null,
      operateurIs: "",
      achatData: {
        service: null,
        wallet: null,
        beneficiaire: null,
        numero: null,
        montant: null,
        recipient: null,
        telephone: null,
        frais: null,
        commentaire: null,
      },
      viewListTransactions: true,
      viewBuyService: false,
      listTransactions: [],
      listWallet: [],
      listRecipient: [],
      listServiceMix: [],
      fraisData: [
        { id: "1", libelle: "OUI", ischecked: true },
        { id: "2", libelle: "NON", ischecked: false },
      ],
      listService: [
        { id: "1", libelle: "Crédit", ischecked: false },
        { id: "2", libelle: "MIX", ischecked: false },
        { id: "3", libelle: "Money", ischecked: false },
      ],
      page: 1,
      isLoading: false,
      fullPage: true,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
      enterpageno: "",
      search: "",
      idWallet: "",
      recipientType: "",
      number: {
        decimal: ".",
        separator: " ",
        // prefix: "FCFA ",
        precision: 2,
      },
    };
  },
  computed: {
    placeholder() {
      return this.operateurIs === "MOOV"
        ? "Ex: 01 00 00 00 00 "
        : this.operateurIs === "MTN"
        ? "Ex : 05 00 00 00 00"
        : this.operateurIs === "ORANGE"
        ? "Ex: 07 00 00 00 00"
        : this.achatData.service === "Money"
        ? "Entrez un numéro"
        : "";
    },
    filteredListTransactions() {
      return this.listTransactions?.filter((row) => {
        const date = row.create_time?.toLowerCase();
        const service = row.service?.toLowerCase();
        const cout = row.cout?.toLowerCase();
        const telephone = row.telephone?.toLowerCase();
        const operateur = row.operateur?.toLowerCase();
        const etat = row.etat?.toLowerCase();
        const emetteur = row.emetteur?.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          date.includes(searchTerm) ||
          service.includes(searchTerm) ||
          cout.includes(searchTerm) ||
          telephone.includes(searchTerm) ||
          operateur.includes(searchTerm) ||
          etat.includes(searchTerm) ||
          emetteur.includes(searchTerm)
        );
      });
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.soldeMoney = this.user?.compte_money?.solde;
    this.getAllTransactions();
    this.getAllWallet();
  },
  created() {
    document.title =
      "Services | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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
    toggleView() {
      this.viewListTransactions = !this.viewListTransactions;
      this.viewBuyService = !this.viewBuyService;
      this.recipientType = "";
    },
    onSelectAllRecipient(event) {
      if (event.target.checked) {
        this.listRecipient.forEach((element) => {
          element.ischecked = true;
        });
      } else {
        this.listRecipient.forEach((element) => {
          element.ischecked = false;
        });
      }
      console.log(event.target.checked);
    },
    onSelectRecipient(data) {
      this.achatData.recipient = data.telephone;
    },
    onSelectService(data) {
      console.info(data);
      this.achatData.service = data.target.value;
      this.showMyself = false;
      if (this.achatData.service === "Money") {
        this.getAllRecipientByWallet();
        this.showMyself = true;
      }
    },
    onSelectFrais(data) {
      console.info(data);
      this.achatData.frais = data.target.value;
      console.info("frais is :", data.target.value);
    },
    onSelectWallet(data) {
      this.achatData.telephone = data.telephone;
      console.log("telephone selected is :", this.achatData.telephone);
      this.operateurIs = data.operateur;
      console.log("operateurIs selected :", this.operateurIs);
      this.achatData.wallet = data.id;
      this.idWallet = data.id;
      this.getAllRecipientByWallet(data.id);
      this.getAllServiceMixByWallet(data.idoperateur);
    },
    onSelectBac(event) {
      this.recipientType = event.target.value;
      this.achatData.beneficiaire = this.recipientType;
      console.log("beneficaire is :", this.recipientType);
    },
    getAllTransactions() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}services/getAllTransactionByClient/${this.user.id}/${this.page}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listTransactions = [...response.data.data];
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
    getAllWallet() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}portefeuille/getAllportefeuilleByClient/${this.user.id}`
        )
        .then((response) => {
          this.isLoading = false;
          this.listWallet = [...response.data];
          console.log(this.listWallet);
        })
        .catch((error) => {
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },
    getAllRecipientByWallet(id) {
      this.isLoading = true;
      let url;
      if (this.achatData.service === "Money") {
        url = `portefeuille/getAllBeneficiaireByClientId/${this.user.id}`;
      } else {
        url = `portefeuille/getAllBeneficiaireByPortefeuille/${id}`;
      }
      axios
        .get(`${Config.BASE_URL}${url}`)
        .then((response) => {
          this.isLoading = false;
          this.listRecipient = [...response.data];
        })
        .catch((error) => {
          this.isLoading = false;
          this.$toast.open({
            message: `${JSON.stringify(error)}`,
            type: "error",
          });
        });
    },
    getAllServiceMixByWallet(id) {
      this.isLoading = true;
      axios
        .get(`${Config.BASE_URL}services/getAllServiceDataByOperateur/${id}`)
        .then((response) => {
          this.isLoading = false;
          this.listServiceMix = [...response.data];
          console.log("listServiceMix is :", this.listServiceMix);
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
      this.getAllTransactions();
    },
    openModalRapport() {},

    buyAirtime() {
      console.log(this.achatData.recipient);
      this.isLoading = true;
      const data = {
        ...(this.achatData.service === "Money"
          ? {
              numero:
                this.recipientType === "myself"
                  ? this.achatData.telephone
                  : this.recipientType === "beneficiaire"
                  ? this.selectedRecipient
                  : this.recipientType === "numero"
                  ? this.achatData.numero.split(" ").join("")
                  : this.achatData.recipient,
            }
          : {
              beneficiaire:
                this.recipientType === "myself"
                  ? this.achatData.telephone
                  : this.recipientType === "beneficiaire"
                  ? this.selectedRecipient
                  : this.recipientType === "numero"
                  ? this.achatData.numero.split(" ").join("")
                  : this.achatData.recipient,
            }),
        ...(this.achatData.service === "MIX"
          ? { service: this.selectedServiceMix }
          : {
              montant: this.achatData.montant,
            }),
        user_id: this.user.id,
        ...(this.achatData.service === "Money"
          ? { idcompte: this.user.compte_money.id }
          : {}),
        ...(this.achatData.service === "Money"
          ? { avecfrais: JSON.parse(this.achatData.frais) }
          : {}),
        ...(this.achatData.service === "Money"
          ? { commentaire: this.achatData.commentaire }
          : {}),
      };
      let url;
      if (this.achatData.service === "Money") {
        url = "money/transfert";
      } else {
        url = "services/AchatCredit";
      }
      axios
        .post(`${Config.BASE_URL}${url}`, data)
        .then((response) => {
          this.clearForm();
          this.isLoading = false;
          this.getAllWallet();
          this.clearForm();
          if (response.data.error) {
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "error",
            });
          } else if (response.data.rapport[0].error) {
            EventBus.$emit("open", {
              component: Rapport,
              props: response.data.rapport[0],
            });
          } else {
            if (this.achactData.service ==='Money') {
              this.$modal.show('hello-world');
              // this.$redirect.push({path: 'transfert'});
            //  window.location.href = '/dashboard/transfert'
            }
            this.$toast.open({
              position: "top-right",
              message: `${response.data.message}`,
              type: "success",
            });
            this.achatData.montant = "";
            this.achatData.numero = "";
            this.toggleView();
            this.getAllTransactions();
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

    clearForm() {
      this.selectedRecipient = [];
      this.RecipientType = [];
      this.achactData = [];
      this.achatData.recipient = "";
      this.selectedServiceMix = "";
    },

    exportExcel() {
      saveExcel({
        data: this.listTransactions,
        fileName: "Mes_Transactions",
        columns: [
          { field: "create_time", title: "Date" },
          { field: "service", title: "Service" },
          { field: "cout", title: "Coût (FCFA)" },
          { field: "telephone", title: "Béneficiaire" },
          { field: "operateur", title: "Flotte" },
          { field: "etat", title: "Etat" },
          { field: "emetteur", title: "Initiateur" },
        ],
      });
    },
  },
};
</script>

<style scoped>
.overflow-hidden {
  overflow: hidden;
}

.form-check-input {
  border: 1rem solid black;
}

thead {
  background: #192a56;
  color: #fff;
  font-size: 16px !important;
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
