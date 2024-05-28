<script lang="ts">
import './defaultStyles.scss'
import '../app.css'

const { children } = $props()
</script>

<header>
  <nav class="mb-2 bg-neutral-800">
    <div>Nav bar work in progress</div>
    <a href="/">Home</a>
    <a href="/descriptionEditor/">Description Editor</a>
  </nav>
</header>

{@render children()}
