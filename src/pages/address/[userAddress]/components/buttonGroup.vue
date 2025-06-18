<template>
  <div class="button-group">
    <button
      v-for="(item, index) in options"
      :key="index"
      :class="{ active: activeValue === item.id }"
      @click.stop="click(item)"
    >
      {{ item.name }}
    </button>
  </div>
</template>

<script>
export default {
  name: "ButtonGroup",
  props: {
    options: {
      type: Array,
      default: () => []
    },
    activeValue: {
      type: [Number, String],
      default: ''
    }
  },
  methods: {
    click(item) {
      this.$emit("update:activeValue", item.id)
      this.$emit("change", item)
    }
  }
}
</script>

<style scoped lang="scss">
.button-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--a-btn-bg-1-color);
  padding: 1px;
  border-radius: 4px;
  font-size: 12px;
  height: 28px;

  button {
    border: none;
    color: var(--a-text-2-color);
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
    border-radius: 4px;
    background: transparent;
    min-width: 36px;
    padding: 5px 10px;
    text-align: center;

    &.active {
      color: var(--a-text-1-color);
      background: var(--a-bg-2-color);
    }
  }
}
</style>
