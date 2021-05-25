<template>
  <div class="action" v-if="!state.matches('finish')">
    <button @click="activeButton.action">
      {{ activeButton.label }}
    </button>
    <span style="display: block">{{ state.context.errorMessage }}</span>
  </div>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  props: ["state", "activeButton"]
});
</script>
