<script lang="ts">
import type { TextColors } from '$lib/editor/extensions/textColor'
let {
  color,
}: {
  color: TextColors
} = $props()
</script>

<svg viewBox="0 0 39 37" xmlns="http://www.w3.org/2000/svg" class="h-5 w-6">
  <text x="5" y="25" class="font-bold text-3xl font fill-LM-text dark:fill-DM-text">A</text>
  <line x1="5" y1="32" x2="27" y2="32" class={color} stroke-width="4" />
</svg>
