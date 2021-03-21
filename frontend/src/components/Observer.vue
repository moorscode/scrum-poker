<template>
  <div class="observe">
    <label>
      <input
        v-model="observer"
        type="checkbox"
      >
      {{ observing }}
    </label>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "observer",
	created() {
		const observing = window.localStorage.getItem( this.room + "-observer" ) === "true";
		this.$store.commit( "observe", observing );
		if ( observing ) {
			this.$socket.client.emit( "observe", { poker: this.room } );
		}
	},
	computed: {
		...mapState( [ "room", "joinPoker", "nickname" ] ),
		observer: {
			get() {
				return this.$store.state.observer;
			},
			set( observing ) {
				window.localStorage.setItem( this.room + "-observer", observing );
				this.$store.commit( "observe", observing );

				if ( observing ) {
					this.$socket.client.emit( "observe", { poker: this.room } );
				} else {
					this.$socket.client.emit( "join", { poker: this.room, name: this.nickname } );
				}
			},
		},
		observing() {
			return this.observer ? "Observing…" : "Observe";
		},
	},
	sockets: {
		joined() {
			if ( this.observer ) {
				this.$socket.client.emit( "observe", { poker: this.room } );
			}
		},
	},
};
</script>
