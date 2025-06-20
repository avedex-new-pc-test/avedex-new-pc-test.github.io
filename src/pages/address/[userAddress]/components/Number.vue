<template>
<span
:class="{
  positive:value > 0,
  negative:value < 0
}">
  {{value > 0 ? '+':''}}{{value < 0 ?'-':''}}{{signVisible?'$':''}}<slot/>
</span>
</template>

<script>
export default {
  name: "Number",
  props:{
    value:[String,Number],
    signVisible:Boolean
  }
}
</script>

<style scoped lang="scss">
span{
  color: var(--d-666-l-959A9F);
  &.positive {
    color: var(--color-teal-300);
  }

  &.negative {
    color: var(--color-red-500);
  }
}
</style>
