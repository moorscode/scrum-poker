<template>
  <section class="credits container">
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
      :title="$socket.connected ? 'Connected to the server.':'Disconnected from the server.'"
    />
  </section>
</template>
<script>
export default {
	name: "Credits",
};
</script>
