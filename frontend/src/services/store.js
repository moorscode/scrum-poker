import Vue from "vue";
import Vuex from "vuex";

Vue.use( Vuex );

/* eslint-disable require-jsdoc */
export default new Vuex.Store( {
	state: {
		loading: true,
		refinementFinished: false,
		connected: false,
		nickname: "", // Required globally because of socket calls.
		activePoker: false, // Required globally because of socket calls.
		points: {},
		observer: false,
		pointSpread: null,
		storyName: "",
		myVote: "",
		members: { voters: [], observers: [], disconnected: [] },
		votes: [],
		voteCount: 0,
		votedNames: [],
		groupedVoterNames: [],
		votesRevealed: false,
		nearestPointAverage: null,
		voteAverage: null,
	},
	mutations: {
		pointSpread( state, spread ) {
			state.pointSpread = spread;
		},
		observe( state, observer ) {
			state.observer = observer;
		},
		showHistory( state ) {
			state.showHistory = true;
		},
		hideHistory( state ) {
			state.showHistory = false;
		},
		nickname( state, nickname ) {
			state.nickname = nickname;
		},
		myVote( state, vote ) {
			state.myVote = vote;
		},
		SOCKET_DISCONNECT( state ) {
			state.connected = false;
		},
		SOCKET_CONNECT( state ) {
			state.connected = true;
		},
		SOCKET_WELCOME( state ) {
			state.loading = false;
		},
		SOCKET_MEMBERLIST( state, members ) {
			state.members = members;
		},
		SOCKET_POINTS( state, points ) {
			state.points = points;
		},
		SOCKET_VOTES( state, data ) {
			const votes = data.votes.sort( ( a, b ) => a.currentValue - b.currentValue ) || [];

			state.votes = votes;
			state.votesRevealed = data.votesRevealed;
			state.voteCount = data.voteCount;
			state.votedNames = data.votedNames || [];
			state.groupedVoterNames = data.groupedVoterNames || [];
			state.nearestPointAverage = data.nearestPointAverage;
			state.voteAverage = data.voteAverage;
			state.votesRevealed = data.votesRevealed;
		},
		SOCKET_STORY( state, name ) {
			state.storyName = name;
		},
		SOCKET_FINISHED( state ) {
			state.refinementFinished = true;
		},
		SOCKET_JOINED( state, data ) {
			state.activePoker = data.poker;
		}
	},

} );
