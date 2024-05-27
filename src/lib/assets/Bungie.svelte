<script lang="ts">
type Images = {
  img:
    | 'arc'
    | 'solar'
    | 'stasis'
    | 'strand'
    | 'void'
    | 'barrier'
    | 'overload'
    | 'unstoppable'
    | 'primary'
    | 'special'
    | 'heavy'
    | 'hunter'
    | 'titan'
    | 'warlock'
    | 'arrow'
}

const { img }: Images = $props()

const xmlns = 'http://www.w3.org/2000/svg'
</script>

<!-- Elements -->
{#if img === 'arc'}
  <svg {xmlns} viewBox="0 0 32 32" fill="#79ecf3">
    <path
      d="m25.2 17.2q-.6.1-.4.6l4.6 8.3q1 2.6.9 5.9l-9.1-9.3q-.3-.3-.5 0l-3.1 5.9q-.7 1.6-2.6 2.9v-6.2q-.1-.7-.7-.4l-8.6 4.7q-2.2.8-5.7.8l9.5-9.2q.3-.2-.2-.5l-6.5-3.4Q1.4 16.4.5 15h6.3q.6 0 .4-.6L2.6 6Q1.7 3.8 1.7 0l9.2 9.6q.3.3.5-.1l3.5-6.7q.9-1.3 2.2-2.1V7q0 .6.6.4l8.8-4.8q2.1-.6 5.5-.7l-9.3 9q-.5.4.2.7l5.4 2.9q1.9.7 3.2 2.7zM16 19.1l3.1-3-3.1-3-3 3z" />
  </svg>
{:else if img === 'solar'}
  <svg {xmlns} viewBox="0 0 23.8 32" fill="#f1641d">
    <path
      d="m23.5 19.6q1.3 6-4.1 10.3-1.6 1.3-4.3 2.1 1.9-.7 3.5-2.6 1.6-1.8 1.7-4.1t-1-4.4-7.4-11.6L4.5 20.9q-1.2 2-1 4.4t1.7 4.1q1.6 1.9 3.5 2.6-2.6-.8-4.3-2.1Q-1 25.6.3 19.6.9 17 3.1 13.7L11.9-0l8.9 13.7q2.1 3.4 2.7 5.8zm-8 8.6q-1.5 1.9-3.6 1.9-2.1 0-3.6-1.9-1.8-2.2-.4-4.8.9-1.6 4-6.9 3 5.1 4 6.9 1.4 2.6-.4 4.8z" />
  </svg>
{:else if img === 'stasis'}
  <svg {xmlns} viewBox="0 0 28 32" fill="#4d87ff">
    <path d="m8 2 7 10v17l-2 3L0 13zm10-2 10 14-5 7-5-6z" />
  </svg>
{:else if img === 'strand'}
  <svg {xmlns} viewBox="0 0 18.3 32" fill="#35e366">
    <path
      d="m7.4 13.5Q3.9 10.7 6.9 8l2.2-1.8L11.3 8q3 2.8-.5 5.5L2 21.1q-5.2 5.4 2.9 10.9-3.5-3.6-.3-7l11.5-10c2.8-2.4 2.8-6.4-.2-9l-6.8-6-6.8 6c-3 2.6-2.9 6.8-.3 9l1.9 1.6zm3.3 9 2.8 2.4q3.3 3.2-.1 7.1c3.2-1.6 6.9-6.6 3.5-10.2l-2.6-2.4z" />
  </svg>
{:else if img === 'void'}
  <svg {xmlns} viewBox="0 0 32 32" fill="#b085e1">
    <path
      d="m16 0a16 16 0 100 32 16 16 0 100-32zM3.6 11.2C5.5 3.9 17-2.3 24.7 6.1c4.3 4.7 3.7 14.8-2.3 16.9 4-2.9 4.8-11.7-.8-16.4-6.2-4.5-13.9-1.3-18 4.6zM21.88 16A1 1 0 1110.1 16a1 1 0 1111.8 0zm6.02 4.3C25.1 29.5 14 32 8.2 26.8c-6.6-5.2-4.7-16.6.91-18.22C4.5 11.6 4.4 22.6 11.9 26.2c6.5 2.5 12.6-.8 16-5.9z" />
  </svg>
  <!-- Breakers -->
{:else if img === 'barrier'}
  <svg {xmlns} viewBox="0 0 37 32" fill="#ffffff">
    <path d="m18.5 0L37 32H0l3.5-6h22.4c.3-.1.4-.5.3-.8L15 5.9zm-7.3 12.5 4 6.9H7.3z" />
  </svg>
{:else if img === 'overload'}
  <svg {xmlns} viewBox="0 0 32 32" fill="#ffffff">
    <path
      d="m16 16h10.6L16.5 0c14.6.5 21.7 19.3 8.6 29.2-.3.2-.6.2-.9-.2L7.9 3.1c-.3-.5-.7-.5-1.2-.1-11.9 8.4-7.3 28.1 8.9 29L5.4 16z" />
  </svg>
{:else if img === 'unstoppable'}
  <svg {xmlns} viewBox="0 0 32 32" fill="#ffffff">
    <path d="m32 29c0 2-1 3-3 3H18l14-14zM24.5 0H32v7.5L7.5 32H0v-7.5zM0 3c0-2 1-3 3-3h11L0 14z" />
  </svg>
  <!-- Ammo -->
{:else if img === 'primary'}
  <svg {xmlns} viewBox="0 0 44.9 32" fill="#ffffff">
    <path
      d="m22.5 7.6c1.4.3 2.6 3.8 2.8 5.6h-5.7c.2-1.8 1.5-5.3 2.9-5.6zm-2.9 7.3h5.7V24h-5.7zM5.6 32 0 26.4V5.6L5.6 0h33.7l5.6 5.6v20.8L39.3 32zm1.6-3.9h30.4l3.2-3.3V7.2l-3.2-3.3H7.3L4.1 7.2v17.6z" />
  </svg>
{:else if img === 'special'}
  <svg {xmlns} viewBox="0 0 44.9 32" fill="#76f48a">
    <path
      d="m18.4 7.6c1.4.3 2.7 3.8 2.8 5.6h-5.6c.1-1.8 1.4-5.3 2.8-5.6zm-2.8 7.3h5.6V24h-5.6zm10.9-7.3c1.4.3 2.7 3.8 2.8 5.6h-5.6c.1-1.8 1.4-5.3 2.8-5.6zm-2.8 7.3h5.6V24h-5.6zM5.6 32-0 26.4V5.6L5.6 0h33.7l5.6 5.6v20.8L39.3 32zm1.6-3.9h30.5l3.2-3.2V7.2L37.7 4H7.3L4.1 7.2v17.7z" />
  </svg>
{:else if img === 'heavy'}
  <svg {xmlns} viewBox="0 0 44.9 32" fill="#b086ff">
    <path
      d="m14.5 7.6c1.4.3 2.7 3.8 2.8 5.6h-5.6c.1-1.8 1.4-5.3 2.8-5.6zm-2.8 7.3h5.6V24h-5.6zm10.8-7.3c1.4.3 2.7 3.8 2.8 5.6h-5.6c.1-1.8 1.4-5.3 2.8-5.6zm-2.8 7.3h5.6V24h-5.6zm10.8-7.3c1.4.3 2.7 3.8 2.8 5.6h-5.6c.1-1.8 1.4-5.3 2.8-5.6zm-2.8 7.3h5.6V24h-5.6zM5.6 32-0 26.4V5.6L5.6 0h33.7l5.6 5.6v20.8L39.3 32zm1.6-3.9h30.5l3.2-3.2V7.2L37.7 4H7.3L4.1 7.2v17.7z" />
  </svg>
  <!-- Classes -->
{:else if img === 'hunter'}
  <svg {xmlns} viewBox="0 0 28 32" fill="#307fc5">
    <path d="m8 10 6 0-7 11 7 0-7 11H0l6-10H0l7-11H0L7 0l7 0zm12 0-6-10 7 0 7 11h-7l7 11h-6l6 10h-7l-7-11 7 0-7-11z" />
  </svg>
{:else if img === 'titan'}
  <svg {xmlns} viewBox="0 0 28 32" fill="#ee423f">
    <path d="m13 16L0 9v14zm2 0 13 7V9zm-1-16L1 8l13 7 13-7zm0 17-13 7 13 8 13-8z" />
  </svg>
{:else if img === 'warlock'}
  <svg {xmlns} viewBox="0 0 58.18 32" fill="#e7a704">
    <path
      d="m9.27 32L22.9 8l-4.36-8L0 32zm10 0 8.91-15.82-4.36-7.64-13.45 23.45zm16-24L48.9 32h9.28L39.63 0zM20.36 32h17.45l-8.72-15.27zm14-23.45L30 16.19l8.91 15.82h8.91zM24.54 8l4.55-8 4.54 8-4.54 7.63z" />
  </svg>
{:else if img === 'arrow'}
  <svg {xmlns} viewBox="0 0 32 32" fill="#f2d164">
    <path d="m16 0 10 10-7 0 0 22-6 0 0-22-7 0z" />
  </svg>
{/if}

{#each Array(10) as _, i}
  <!-- content here -->
{/each}

<style lang="postcss">
svg {
  @apply h-4 w-6;
}
</style>
