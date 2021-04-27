<template>
  <div class="observe">
    <button v-on:click="toggleObserving()">
		<i class="fas fa-binoculars" v-if="! observer"/>
		<i class="fas fa-comments" v-if="observer"/>
		{{ observing }}
	</button>
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
	methods: {
		toggleObserving() {
			this.observer = ! this.observer;
		},
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
			return this.observer ? "Participate" : "Observe";
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
