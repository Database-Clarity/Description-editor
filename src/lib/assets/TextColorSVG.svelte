<script lang="ts">
  import type { TextColors } from '$lib/editor/buttons/textColor'
  export let underlineColor: TextColors = 'default'
</script>

<svg viewBox="0 0 39 37" height="15" xmlns="http://www.w3.org/2000/svg">
  <text x="5" y="28" font-family="Arial" font-size="40" font-weight="700" fill="#d9d9d9">A</text>
  <line x1="5" y1="35" x2="33" y2="35" class={`text-${underlineColor}`} stroke-width="4" />
</svg>
