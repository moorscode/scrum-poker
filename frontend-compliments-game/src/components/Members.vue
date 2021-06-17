<template>
	<section>
		<p>The following members are currently in the room:</p>
		<div class="memberList-heading">
			<div class="member">Participant</div>
			<div>Received compliments</div>
		</div>
		<ul class="memberList">
			<li v-for="member in sortedMembers(game.members)" v-bind:key="member.id" :class="member.id === userId ? 'me' : ''">
				<div class="member"><i :class="['fas', memberIcon(member)]"/> {{ member.name }} {{ member.id === userId ? "(you)" : "" }}</div>
				<div>
					<ul>
						<li v-for="card in receivedCards[member.id]" v-bind:key="'received' + card.description">
							<div class="received">{{ card.description }}</div>
							<div class="received-from">&mdash; from: {{ memberIdToName[card.from] }}</div>
						</li>
					</ul>
				</div>
			</li>
		</ul>
		<div v-if="game.finished" class="center">
			<img src="http://my.yoast.com/static/media/checkout-success.3712b637.svg" width="200">
			<p>That was it, thanks for participating!</p>
			<p>If you like you can start again, but please note that the received compliments will be erased.</p>
		</div>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "Members",
	computed: {
		...mapState( [ "game", "userId", "memberIdToName", "members", "turn" ] ),
		receivedCards() {
			return this.game.members.reduce(
				( list, member ) => {
					list[ member.id ] = this.game.cards.filter( ( card ) => card.to === member.id );
					return list;
				},
				[],
			);
		},
	},
	methods: {
		sortedMembers( source ) {
			const members = Object.values( source );
			members.sort( ( a, b ) => {
				if ( a.id === this.userId ) {
					return -1;
				}
				if ( b.id === this.userId ) {
					return 1;
				}
				return 0;
			} );
			return members;
		},
		memberIcon( member ) {
			if ( ! member.connected ) {
				return "fa-user-slash";
			}

			if ( member.ready ) {
				return "fa-user-check";
			}

			return "fa-user";
		},
	},
};
</script>
