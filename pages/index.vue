<template>
  <div>
    <v-key-virtual-key :show="true" >
      <textarea id="input" name="input" class="text_css" />
    </v-key-virtual-key>
  </div>
</template>

<script>

export default {
  mounted() {
    this.inputElement = document.getElementById('input');
  },
  data() {
    return {
      inputElement: null,
    }
  }
};
</script>

<style>
.text_css {
  width: 100%;
  height: 20vh;
}
</style>
