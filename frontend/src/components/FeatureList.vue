<template>
  <section
    v-cloak
    class="poker container"
  >
    <h2>Features</h2>
    <h3>Voting</h3>
    <p>
      You can vote to set what amount of points you think the current story is. You can change your vote
      while one or more member has not cast a vote yet. When everybody has voted, you cannot change your
      vote anymore unless you start a new story.
    </p>
    <p>
      Observers cannot vote.
    </p>
    <p>
      Voting for a coffee-break will short-circuit the results, requiring a re-vote after the break. The
      coffee-break is not added the history.
    </p>

    <p>
      Naming a story will make the history more usable.
      It is not required to name a story!
      Everybody can name or rename a story.
      A checkmark will show if the current name is the name registered for the story on the server.
    </p>

    <h3>Rooms</h3>
    <p>
      You can join a room by entering a room name in input box above, or you can add a `?room={your room}` to the
      URL to quickly go to that room. It is recommended to share the URL if you want teammembers to join your room
      easily.
    </p>

    <h3>Nickname</h3>
    <p>
      You can change your nickname at any time. The history will store the nickname you had at the moment when all
      votes were in. Your nickname is stored in your browser, to have it remembered when you come back the next
      time.
    </p>

    <h3>Observer-mode</h3>
    <p>
      While observing you cannot vote, start a new story or reset the history. You're just a fly on the
      wall. Observer-mode is stored on a per-room setting, so when you return to a room you'll automatically be
      set as an observer or as a regular member.
    </p>

    <h3>Story history</h3>
    <p>
      The story-history will be saved as long as there are members in the room. When a member uses the
      button to reset the history it will be gone from the room. The same counts when removing the last history
      item.
    </p>
  </section>
</template>
<script>

export default {
	name: "FeatureList",
};
</script>
