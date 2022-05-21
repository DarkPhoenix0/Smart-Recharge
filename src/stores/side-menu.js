import { defineStore } from "pinia";

export const useSideMenuStore = defineStore("sideMenu", {
  userData : JSON.parse(localStorage.getItem("user")),

  state: () => ({
    menu: [
      {
        icon: "HomeIcon",
        pageName: "Home",
        title: "Tableau de bord",
      },
      {
        icon: "BoxIcon",
        pageName: "Services",
        title: "Services",
      },
      "devider",
      // {
      //   icon: "StarIcon",
      //   pageName: "Dotations",
      //   title: "Mes dotations",
      // },
      // {
      //   icon: "CheckSquareIcon",
      //   pageName: "Chargements",
      //   title: "Mes rechargements",
      // },
      // {
      //   icon: "MessageSquareIcon",
      //   pageName: "Souscriptions",
      //   title: "Mes souscriptions",
      // },
      // {
      //   icon: "MessageSquareIcon",
      //   pageName: "HistoriqueTransactions",
      //   title: "Historique trans.",
      // },
      {
        icon: "CalendarIcon",
        pageName: "Reporting",
        title: "Reporting",
      },
      {
        icon: "MessageCircleIcon",
        pageName: "EnvoiSMS",
        title: "Envoyer SMS",
      },

      "devider",
      {
        icon: "ExpandIcon",
        pageName: "Flottes",
        title: "Mes flottes",
      },
      {
        icon: "Minimize2Icon",
        pageName: "BlankLayout",
        title: "Mobile money",
        subMenu: [
          {
            icon: "",
            pageName: "Transfert",
            title: "Transactions MoMo",
          },
          {
            icon: "",
            pageName: "Retrait",
            title: "Retirer de l'argent",
          },
          {
            icon: "",
            pageName: "ChargerCompte",
            title: "Charger compte",
          },
        ],
      },

      {
        icon: "ShrinkIcon",
        pageName: "BlankLayout",
        title: "Charger flottes",
        subMenu: [
          {
            icon: "GitPullRequestIcon",
            pageName: "ChargementDirect",
            title: "Chargement direct",
          },
          {
            icon: "UsersIcon",
            pageName: "ChargementCollect",
            title: "Chargement collect",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "ReportingCollect",
            title: "Reporting collect ",
          },
          {
            icon: "ShoppingCartIcon",
            pageName: "BlankLayoutz",
            title: "Flotte en masse",
            subMenu: [
              {
                icon: "GitPullRequestIcon",
                pageName: "ChargementMasseData",
                title: "Chargement Data",
              },
              {
                icon: "GitPullRequestIcon",
                pageName: "ChargementMasseAirtime",
                title: "Chargement Airtime",
              },
            ],
          },
        ],
      },
      {
        icon: "GitPullRequestIcon",
        pageName: "BlankLayout",
        title: "Gestion dotation",
        subMenu: [
          {
            icon: "GitPullRequestIcon",
            pageName: "DotationPonctuelleGlobale",
            title: "Ponctuelles globales",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "DotationPonctuelleCliente",
            title: "Ponctuelles clientes",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "DotationMensuelleGlobale",
            title: "Mensuelles globales",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "DotationMensuelleCliente",
            title: "Mensuelle clientes",
          },
        ],
      },
      {
        icon: "LibraryIcon",
        pageName: "BlankLayout",
        title: "Comptabilité",
        subMenu: [
          {
            icon: "GitPullRequestIcon",
            pageName: "Commande",
            title: "Mes commandes",
          },
          {
            icon: "ShoppingCartIcon",
            pageName: "Facture",
            title: "Mes factures",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "Releve",
            title: "Relévé de compte",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "Paiement",
            title: "Mes paiements",
          },
        ],
      },
      
      {
        icon: "SettingsIcon",
        pageName: "BlankLayout",
        title: "Paramétrer",
        subMenu: [
          {
            icon: "GitPullRequestIcon",
            pageName: "GestionFlotte",
            title: "Gestion Flottes",
          },
          {
            icon: "UsersIcon",
            pageName: "BlankLayoutz",
            title: "Utilisateurs",
            subMenu: [
              {
                icon: "GitPullRequestIcon",
                pageName: "GestionUtilisateur",
                title: "Liste",
              },
              {
                icon: "GitPullRequestIcon",
                pageName: "GestionProfil",
                title: "Profils",
              },
            ],
          },
        ],
      },
      {
        icon: "ContactIcon",
        pageName: "",
        title: "Béneficiaires",
        subMenu: [
          {
            icon: "MessageSquareIcon",
            pageName: "Beneficiaire",
            title: "Liste",
          },
          {
            icon: "GitPullRequestIcon",
            pageName: "HistoriqueActivations",
            title: "Hist. activations",
          },
          {
            icon: "UserPlusIcon",
            pageName: "GroupeBeneficiaire",
            title: "Groupe",
          },
        ],
      },
    ],
  }),
});
