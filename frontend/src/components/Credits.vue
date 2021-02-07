<template>
  <section class="credits">
    Build using <a
      href="https://nestjs.com/"
      target="_blank"
    >NestJS</a>
    & <a
      href="https://vuejs.org/"
      target="_blank"
    >Vue.js</a>
    - <a
      href="https://github.com/moorscode/scrum-poker/"
      target="_blank"
    >source</a> on GPL 3.0+
    &mdash;
    <i
      class="fas fa-plug"
      :class="$socket.connected ? 'connected':'disconnected'"
      title="Connection status"
    />
  </section>
</template>
<script>
export default {
	name: "Credits",
};
</script>
