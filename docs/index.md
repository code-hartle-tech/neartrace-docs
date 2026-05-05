---
layout: page
head:
  - - meta
    - http-equiv: refresh
      content: "0; url=/guide/getting-started"
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'
const router = useRouter()
onMounted(() => router.go('/guide/getting-started'))
</script>
