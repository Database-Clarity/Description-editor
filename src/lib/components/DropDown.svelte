<script lang="ts">
  let dropdownOpen = false

  const handleFocusLoss = ({ relatedTarget, currentTarget }: FocusEvent) => {
    if (relatedTarget && (currentTarget as Node)?.contains(relatedTarget as Node)) return
    dropdownOpen = false
  }
</script>

<div on:focusout={handleFocusLoss} class="dropDown">
  <button on:click={() => (dropdownOpen = !dropdownOpen)}>
    <slot name="button" />
  </button>

  {#if dropdownOpen}
    <div class="dropDownContent">
      <slot name="content" />
    </div>
  {/if}
</div>

<style lang="scss">
  .dropDown {
    display: inline-block;
  }
  .dropDownContent {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 99;
  }
  button {
    border: none;
    cursor: pointer;
  }
</style>
