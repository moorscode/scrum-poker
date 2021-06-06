<template>
	<section>
		<ul class="memberList">
			<li v-for="member in game.members" v-bind:key=member :class="member.id === userId ? 'me' : ''">
				<div><i class="fas fa-person-booth"/> {{ member.name }}</div>
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
							from: {{ memberIdToName[ card.from ]}}
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
		...mapState( [ "game", "userId", "memberIdToName" ] ),
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
};
</script>
