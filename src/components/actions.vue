<template>
  <div class="action" v-if="!state.matches('finish')">
    <button @click="activeButton.action">
      {{ activeButton.label }}
    </button>
    <span style="display: block">{{ state.context.errorMessage }}</span>
  </div>
</template>
<script>
export default {
  props: ["state", "activeButton"]
};
</script>
