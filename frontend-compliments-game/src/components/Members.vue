<template>
	<section>
		<ul class="memberList">
			<li v-for="member in game.members" v-bind:key=member>
				<div><i class="fas fa-person-booth"/> {{ member.name }}</div>
				<div>
					<ul>
						<li v-for="card in pendingCards[member.id]" v-bind:key="card">
							{{ member.id === userId ? card.description : "?" }}
						</li>
					</ul>
				</div>
				<div>
					<ul>
						<li v-for="card in receivedCards[member.id]" v-bind:key="card">
							{{ card.description }}<br/>
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
