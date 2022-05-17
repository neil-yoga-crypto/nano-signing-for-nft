<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    data() {
        // replace this
        let address='nano_3boxqk5q56xsz8ufrw9srrz4pta6ffbkrg9j31aqziz8wtnr6j68ci7s4cnc';
        return {address:address,justCopied:false};
    },
});
</script>

<template>
  <nanoproof />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
