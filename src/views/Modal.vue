<template>
  <div>
    <div
      class="modal opacity-0"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="'exampleModal-' + flotte.id">{‌{flotte.id}}</h5>
            <button
              type="button"
              class="absolute pin-t pin-b pin-r px-4 py-3"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            {‌{flotte.title}}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="inline-block align-middle text-center select-none border font-normal whitespace-no-wrap py-2 px-4 rounded text-base leading-normal no-underline text-grey-lightest bg-grey hover:bg-grey-light"
              data-dismiss="modal"
            >
              ❌
            </button>
            <button type="button" class="btn text-blue-lightest bg-blue hover:bg-blue-light">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
export default {
  props: {
    flotte: {
      type: Object,
    },
  },
};
</script>