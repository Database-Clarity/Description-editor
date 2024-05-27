<script lang="ts">
import './defaultStyles.scss'
import '../app.css'

const { children } = $props()
</script>

<header>
  <nav class="bg-neutral-800 mb-2">
    <div>Nav bar work in progress</div>
    <a href="/">Home</a>
    <a href="/descriptionEditor/">Description Editor</a>
  </nav>
</header>

{@render children()}
