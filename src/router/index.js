import { createRouter, createWebHistory } from "vue-router";
import SideMenu from "../layouts/side-menu/Main.vue";
import Dashboard from "../views/dashboard/Main.vue";
import Services from "../views/services/Main.vue";
import Transfert from "../views/transfert/Main.vue";
import Dotations from "../views/dotations/Main.vue";
import Chargements from "../views/chargements/Main.vue";
import Souscriptions from "../views/souscriptions/Main.vue";
import HistoriqueTransactions from "../views/historique-transactions/Main.vue";
import HistoriqueActivations from "../views/historique-activation/Main.vue";
import Reporting from "../views/reporting/Main.vue";
import DotationPonctuelleGlobale from "../views/dotation-ponctuelle-globale/Main.vue";
import DotationMensuelleGlobale from "../views/dotation-mensuelle-globale/Main.vue";
import DotationPonctuelleCliente from "../views/dotation-ponctuelle-cliente/Main.vue";
import DotationMensuelleCliente from "../views/dotation-mensuelle-cliente/Main.vue";
import Paiement from "../views/paiement/Main.vue";
import Facture from "../views/facture/Main.vue";
import Releve from "../views/releve/Main.vue";
import Retrait from "../views/retrait/Main.vue";
import Commande from "../views/commande/Main.vue";
import Beneficiaire from "../views/beneficiaire/Main.vue";
import GestionFlotte from "../views/gestion-flotte/Main.vue";
import GestionUtilisateur from "../views/gestion-utilisateur/Main.vue";
import GestionProfil from "../views/gestion-profil/Main.vue";
import ChargerCompte from "../views/charger-compte/Main.vue";
import ReportingCollect from "../views/reporting-collect/Main.vue";
import ChargementCollect from "../views/chargement-collect/Main.vue";
import ChargementMasseData from "../views/chargement-masse-data/Main.vue";
import ChargementMasseAirtime from "../views/chargement-masse-airtime/Main.vue";
import ChargementDirect from "../views/chargement-direct/Main.vue";
import EnvoiSMS from "../views/envoi-sms/Main.vue";
import GroupeBeneficiaire from "../views/groupe-beneficiaire/Main.vue";
import Flottes from "../views/flottes/Main.vue";
import Login from "../views/login/Main.vue";
import ForgotPassword from "../views/reset-password/Main.vue";
import Register from "../views/register/Main.vue";
import ErrorPage from "../views/error-page/Main.vue";

const routes = [
  { path: '', redirect: { name: 'login' } },
  {
    path: "/",
    name: "login",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: ForgotPassword,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/error-page",
    name: "error-page",
    component: ErrorPage,
  },
  {
    path: "/:pathMatch(.*)*",
    component: ErrorPage,
  },
  {
    path: "/dashboard",
    component: SideMenu,
    children: [
      {
        path: "home",
        name: "Home",
        component: Dashboard,
      },
      {
        path: "services",
        name: "Services",
        component: Services,
      },
      {
        path: "dotations",
        name: "Dotations",
        component: Dotations,
      },
      {
        path: "flottes",
        name: "Flottes",
        component: Flottes,
      },
      {
        path: "chargements",
        name: "Chargements",
        component: Chargements,
      },
      {
        path: "souscriptions",
        name: "Souscriptions",
        component: Souscriptions,
      },
      {
        path: "historique-transactions",
        name: "HistoriqueTransactions",
        component: HistoriqueTransactions,
      },
      {
        path: "reporting",
        name: "Reporting",
        component: Reporting,
      },
      {
        path: "beneficiaire",
        name: "Beneficiaire",
        component: Beneficiaire,
      },
      {
        path: "charger-compte",
        name: "ChargerCompte",
        component: ChargerCompte,
      },
      {
        path: "chargement-direct",
        name: "ChargementDirect",
        component: ChargementDirect,
      },
      {
        path: "chargement-collect",
        name: "ChargementCollect",
        component: ChargementCollect,
      },
      {
        path: "reporting-collect",
        name: "ReportingCollect",
        component: ReportingCollect,
      },
      {
        path: "chargement-masse-data",
        name: "ChargementMasseData",
        component: ChargementMasseData,
      },
      {
        path: "chargement-masse-airtime",
        name: "ChargementMasseAirtime",
        component: ChargementMasseAirtime,
      },
      {
        path: "dotation-ponctuelle-globale",
        name: "DotationPonctuelleGlobale",
        component: DotationPonctuelleGlobale,
      },
      {
        path: "dotation-mensuelle-globale",
        name: "DotationMensuelleGlobale",
        component: DotationMensuelleGlobale,
      },
      {
        path: "dotation-ponctuelle-cliente",
        name: "DotationPonctuelleCliente",
        component: DotationPonctuelleCliente,
      },
      {
        path: "dotation-mensuelle-cliente",
        name: "DotationMensuelleCliente",
        component: DotationMensuelleCliente,
      },
      {
        path: "paiement",
        name: "Paiement",
        component: Paiement,
      },
      {
        path: "releve",
        name: "Releve",
        component: Releve,
      },
      {
        path: "retrait",
        name: "Retrait",
        component: Retrait,
      },
      {
        path: "facture",
        name: "Facture",
        component: Facture,
      },
      {
        path: "commande",
        name: "Commande",
        component: Commande,
      },
      {
        path: "envoi-sms",
        name: "EnvoiSMS",
        component: EnvoiSMS,
      },
      {
        path: "transfert",
        name: "Transfert",
        component: Transfert,
      },
      {
        path: "historique-activation",
        name: "HistoriqueActivations",
        component: HistoriqueActivations,
      },
      {
        path: "gestion-flotte",
        name: "GestionFlotte",
        component: GestionFlotte,
      },
      {
        path: "gestion-utilisateur",
        name: "GestionUtilisateur",
        component: GestionUtilisateur,
      },
      {
        path: "gestion-profil",
        name: "GestionProfil",
        component: GestionProfil,
      },
      {
        path: "groupe-beneficiaire",
        name: "GroupeBeneficiaire",
        component: GroupeBeneficiaire,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 };
  },
});

export default router;
