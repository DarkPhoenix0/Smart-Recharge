<template>
  <!-- BEGIN: Top Bar -->
  <div class="top-bar">
    <!-- BEGIN: Breadcrumb -->
    <nav aria-label="breadcrumb" class="-mr-auto hidden sm:flex">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">Smart-R</a></li>
        <li class="breadcrumb-item active" aria-current="page">Espace utilisateur</li>
      </ol>
    </nav>
    <!-- END: Breadcrumb -->
    <!-- BEGIN: Notifications -->
    <Dropdown class="mr-auto sm:mr-6  pos-notifications">
      <DropdownToggle
        tag="div"
        role="button"
        class="notification notification--bullet cursor-pointer"
      >
        <BellIcon class="notification__icon dark:text-slate-500" />
      </DropdownToggle>
      <DropdownMenu class="notification-content pt-2">
        <DropdownContent tag="div" class="notification-content__box">
          <div class="notification-content__title">Notifications</div>
        </DropdownContent>
      </DropdownMenu>
    </Dropdown>
    <!-- END: Notifications -->
    <!-- BEGIN: Account Menu -->
    <Dropdown class="w-8 h-8  pos-account">
      <DropdownToggle
        tag="div"
        role="button"
        class="w-8 h-8 rounded-full overflow-hidden shadow-lg image-fit zoom-in"
      >
        <img
          alt="Profile user"
          src="@/assets/images/dashboard/profile.png"
        />
      </DropdownToggle>
      <DropdownMenu class="w-56">
        <DropdownContent class="bg-primary text-white">
          <DropdownHeader tag="div" class="!font-normal">
            <div class="font-medium">
              {{ user.nom }} {{ user.prenom }}
            </div>
            <div class="text-xs text-white/70 mt-0.5 dark:text-slate-500">
              {{ user.profil }}
            </div>
          </DropdownHeader>
          <DropdownDivider class="border-white/[0.08]" />
          <DropdownItem class="hover:bg-white/5">
            <UserIcon class="w-4 h-4 mr-2" /> Mon profil
          </DropdownItem>
          <DropdownItem class="hover:bg-white/5">
            <LockIcon class="w-4 h-4 mr-2" /> Modifier mot de passe
          </DropdownItem>
          <DropdownItem class="hover:bg-white/5">
            <HelpCircleIcon class="w-4 h-4 mr-2" /> Aide
          </DropdownItem>
          <DropdownDivider class="border-white/[0.08]" />
          <DropdownItem class="hover:bg-white/5">
            <ToggleRightIcon class="w-4 h-4 mr-2" /> Déconnexion
          </DropdownItem>
        </DropdownContent>
      </DropdownMenu>
    </Dropdown>
    <!-- END: Account Menu -->
  </div>
  <!-- END: Top Bar -->
</template>

<script>
import { ref } from "vue";
import Loading from "vue-loading-overlay";
import axios from "axios";
import Config from "../../config.json";

export default {
  data: function() {
    return {
      user: ''
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user'));
  },
};

const searchDropdown = ref(false);
const showSearchDropdown = () => {
  searchDropdown.value = true;
};
const hideSearchDropdown = () => {
  searchDropdown.value = false;
};
</script>
