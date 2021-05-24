<template>
  <div class="score">
    <div class="count correct">
      {{ score.correct }}
    </div>
    <div class="count incorrect">
      {{ score.incorrect }}
    </div>
  </div>
</template>
<script>
export default {
  props: ["score"],
};
</script>