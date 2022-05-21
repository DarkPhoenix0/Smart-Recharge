<template>
  <loading
    v-model:active="isLoading"
    :can-cancel="true"
    :is-full-page="fullPage"
  />
  <div class="flex items-center mt-8">
    <h2 class="text-2xl font-bold font-medium mr-auto">Gestion des profils</h2>
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
      <button v-on:click="newProfil('new','Formulaire profil','')"
        class="btn btn-primary shadow-md mr-2">
        <i class="fas fa-user-plus"></i>&nbsp; Nouveau
      </button>
      <button @click="getAllProfil" class="btn btn-light shadow-md mr-2">
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
            <th>LIBELE</th>
            <th>DESCRIPTION</th>
            <th>MODIFIER</th>
            <th>SUPPRIMER</th>
          </tr>
        </thead>
        <tbody>
           <tr class="w-40 text-center justify-content-center text-2xl">
            <div v-if="!listProfil.length">Aucune donnée disponible</div>
          </tr>
          <tr
            v-for="(profil, profilKey) in filteredListProfil"
            :key="profilKey"
            class=""
          >
            <td class="w-20 border border-slate-300">
              <span v-if="profil">{{ profil.libelle }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <span v-if="profil">{{ profil.description }}</span>
            </td>
            <td class="w-20 border border-slate-300">
              <button class="btn btn-primary shadow-md mr-2"
               @click="newProfil('edit', 'Modification profil', profil)">
                  <i class="fas fa-edit"></i>
              </button>
            </td>
            <td class="w-20 border border-slate-300">
              <button class="btn btn-danger shadow-md mr-2"
               @click="supprimerProfil">
                  <i class="fas fa-trash"></i>
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
     <b class="text-2xl text-center justify-content-center">{{title}}</b>
    </ModalHeader>
    <ModalBody class="grid grid-cols-12 gap-4 gap-y-3">
       <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="libelle" class="form-label">
          <b>Libéllé <span class="text-danger">*</span></b>
        </label>
        <input
        v-model="createProfil.libelle"
          id="pos-form-3"
          type="text"
          class="form-control flex-1"
          placeholder="Entrez le libellé"
        />
      </div>
      <div v-if="vue === 'new' || vue === 'edit'" class="col-span-12">
        <label for="description" class="form-label">
          <b>Description <span class="text-danger">*</span></b>
        </label>
          <textarea
            class="w-full form-control shadow-inner border-2"
            placeholder="Saisir la description.."
            rows="4"
            name="description"
            v-model="createProfil.description"
          >
          </textarea>
      </div>
      <div class="x-item">
        <label>
          <input type="checkbox"  @change="onChange($event.target.checked)">
          <span></span>
        </label>
        <div v-if="rootItem">
          <x-item v-for="item in rootItem" ref="children" :item="item" @change="onChildChange">
          </x-item>
        </div>
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
      props: ['item'],
      newOrderModal : ref(false),
      addItemModal : ref(false),
      title: "",
      vue: "",
      createProfil: {
        libelle: null,
        description: null,
        file: null,
      },
      selectedRecipient: "",
      listRecipient: [],
      listProfil: [],
      page: 1,
      isLoading: false,
      fullPage: true,
      totalPages: 0,
      totalRecords: 0,
      recordsPerPage: 10,
      enterpageno: "",
      search: "",
      rootItem: [{
      label: 'Select All',
      checked: false,
      children: [{
        label: 'Group 1',
        checked: false,
        children: [{
          label: 'Subgroup 1',
          checked: false,
          children: [
            { label: 'Item 1', checked: false },
            { label: 'Item 2', checked: false }
          ]
        }, {
          label: 'Subgroup 2',
          checked: false,
          children: [
            { label: 'Item 3', checked: false },
            { label: 'Item 4', checked: false }
          ]
        }]
      }, {
        label: 'Group 2',
        checked: false,
        children: [
          { label: 'Item 5', checked: false },
          { label: 'Item 6', checked: false }
        ]
      }]
    }],
    };
  },

  computed: {

      handleValue(){
          if (this.vue === 'edit')
              return this.toEditData.libelle;
          else
              return this.createProfil.libelle;
      },
      handleValueDesc(){
          if (this.vue === 'edit')
              return this.toEditData.description;
          else
              return this.createProfil.description;
      },

      filteredListProfil() {
        return this.listProfil?.filter((row) => {
          const libelle = row.libelle?.toLowerCase();
          const description = row.description?.toLowerCase();
          const searchTerm = this.search.toLowerCase();

          return (
            libelle.includes(searchTerm) ||
            description.includes(searchTerm)
          );
        });
      },
    },

  mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.getAllProfil();
  },


  created() {
    document.title =
      "Gestion profils | Cateli Smart Recharge - Plateforme en ligne de rechargement et d'achat de credits";
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

    newProfil(type, nom, data) {
    this.getAllRecipient();
     if (type === 'new') {
       this.newOrderModal = true
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
     } else if (type === 'masse') {
       this.newOrderModal = true
       console.log('type is :', type)
       this.vue = type;
      this.title = nom;
     } else {
       console.log('type is :', type)
       this.newOrderModal = true
       this.title = nom;
       this.vue = type;
       this.toEditData = data;
     }
    },

    closeModal() {
      this.newOrderModal = false;
      this.selectedRecipient = ""
    },

    getAllRecipient() {
      // this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}login/getAllUserClient`
        )
        .then((response) => {
          this.isLoading = false;
          this.listRecipient = [...response.data.data];
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

    getAllProfil() {
      this.isLoading = true;
      axios
        .get(
          `${Config.BASE_URL}login/getAllProfil`
        )
        .then((response) => {
          this.isLoading = false;
          console.log('Profil is :', response)
          this.listProfil = [...response.data];
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

    onChange(checked) {
        this.item.checked = checked
        this.updateParent()
        this.updateChildren(checked)
    },

    onChildChange() {
        this.item.checked = this.$refs.children.every(child => child.item.checked)
        this.updateParent()
    },

    updateParent() {
        this.$emit('change')
    },

    updateChildren(checked) {
        if (this.item.children) {
            this.$refs.children.forEach(child => {
                child.item.checked = checked
                child.updateChildren(checked)
            })
        }
    },

    onPageChange(page) {
      this.page = page;
      this.getAllProfil();
    },

    exportExcel() {
      saveExcel({
        data: this.listProfil,
        fileName: "Gestion_Flotte",
        columns: [
          { field: "nom", title: "Nom" },
          { field: "prenom", title: "Prénom" },
          { field: "email", title: "Email" },
          { field: "operateur", title: "Opérateur" },
          { field: "telephone", title: "Téléphone" },
          { field: "solde", title: "Solde" },
          { field: "date_creation", title: "Date création" },
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
