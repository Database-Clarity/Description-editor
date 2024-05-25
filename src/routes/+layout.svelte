<script lang="ts">
import './defaultStyles.scss'
import '../app.css'

const { children } = $props()
</script>

<header>
  <nav class="bg-neutral-800 mb-2">
    <div>Nav bar</div>
    <a href="/" target="_blank" rel="noopener noreferrer">Home</a>
    <a href="/descriptionEditor/0" target="_self">Description Editor</a>
  </nav>
</header>

{@render children()}
