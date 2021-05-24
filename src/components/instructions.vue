<template>
  <span v-if="state.matches('initial')">
    There are total three questions in this quiz. You can choose to answer or
    skip. Skipped question will be marked as an incorrect answer.
  </span>
  <div v-if="state.matches('finish')" class="finish">
    Congratulations! You finished.
  </div>
</template>
<script>
export default {
  props: ["state"],
};
</script>