<template>
  <v-icon v-on="$listeners" v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script>
  import { mdiReply } from '@mdi/js'

  export default {
    data: () => ({
      svgPath: mdiReply
    }),
  }
</script>