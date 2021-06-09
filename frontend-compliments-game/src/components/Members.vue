<template>
	<section>
		<p>The following members are currently in the room.</p>
		<div class="memberList-heading">
			<div>Participant</div>
			<div>Pending compliments</div>
			<div>Given compliments</div>
		</div>
		<ul class="memberList">
			<li v-for="member in sortedMembers(game.members)" v-bind:key="member.id" :class="member.id === userId ? 'me' : ''">
				<div><i :class="['fas', memberIcon(member)]"/> {{ member.name }}</div>
				<div>
					<ul>
						<li v-for="card in pendingCards[member.id]" v-bind:key="'pending' + card.description">
							{{ member.id === userId ? card.description : "?" }}
						</li>
					</ul>
				</div>
				<div>
					<ul>
						<li v-for="card in receivedCards[member.id]" v-bind:key="'received' + card.description">
							<div class="received">{{ card.description }}</div>
							<div class="received-from">&mdash; {{ memberIdToName[card.from] }}</div>
						</li>
					</ul>
				</div>
			</li>
		</ul>
	</section>
</template>

<script>
import { mapState } from "vuex";

export default {
	name: "Members",
	computed: {
		...mapState( [ "game", "userId", "memberIdToName", "members" ] ),
		pendingCards() {
			return this.game.members.reduce(
				( list, member ) => {
					list[ member.id ] = this.game.cards.filter( ( card ) => card.from === member.id && ! card.to );
					return list;
				},
				[],
			);
		},
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
