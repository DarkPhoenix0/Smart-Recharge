<template>
  <div>
    <DarkModeSwitcher />
    <div class="container">
      <!-- BEGIN: Error Page -->
      <div
        class="error-page flex flex-col lg:flex-row items-center justify-center h-screen text-center lg:text-left"
      >
        <div class="-lg:mr-20">
          <img
            alt="Rubick Tailwind HTML Admin Template"
            class="h-48 lg:h-auto"
            src="@/assets/images/error-illustration.svg"
          />
        </div>
        <div class="text-white mt-10 lg:mt-0">
          <div class="text-8xl font-medium">404</div>
          <div class="text-xl lg:text-3xl font-medium mt-5">
            Oops. This page has gone missing.
          </div>
          <div class="text-lg mt-3">
            You may have mistyped the address or the page may have moved.
          </div>
          <button
            class="btn py-3 px-4 text-white border-white dark:border-darkmode-400 dark:text-slate-200 mt-10"
          >
            Back to Home
          </button>
        </div>
      </div>
      <!-- END: Error Page -->
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main.vue";
import dom from "@left4code/tw-starter/dist/js/dom";

onMounted(() => {
  dom("body").removeClass("main").removeClass("login").addClass("error-page");
});
</script>
