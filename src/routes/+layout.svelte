<script lang="ts">
import '../app.css'

const { children } = $props()
</script>

<header>
  <nav class="mb-2 bg-DM-15">
    <div>Nav bar work in progress</div>
    <a href="/">Home</a>
    <a href="/descriptionEditor/">Description Editor</a>
  </nav>
</header>

{@render children()}
