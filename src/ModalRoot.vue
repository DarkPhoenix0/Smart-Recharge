<template>
  <Modal :isOpen="!!component" :title="title" @onClose="handleClose">
    <component :is="component" @onClose="handleClose" v-bind="props" />
  </Modal>
</template>

<script>

import  {EventBus}  from './eventbus';

import Modal from "./Modal.vue";


export default {
  data () {
    return {
      component: null,
      title: '',
      props: null
    }
  },
  mounted () {
    EventBus.$on('open', ({ component, title = '', props = null }) => {
      this.component = component
      this.title = title
      this.props = props
    })
    document.addEventListener('keyup', this.handleKeyup)
  },
  beforeDestroy () {
    document.removeEventListener('keyup', this.handleKeyup)
  },
  methods: {
    handleClose () {
      this.component = null
    },
    handleKeyup (e) {
      if (e.keyCode === 27) this.handleClose()
    }
  },
  components: { Modal },
}
</script>
