import Vue from "vue";
import Vuex from "vuex";
import { sortVotes } from "./voteSorting.ts";

Vue.use( Vuex );

/* eslint-disable require-jsdoc */
export default new Vuex.Store( {
	state: {
		loading: true,
		connected: false,
		points: {},
		nickname: "",
		observer: false,
		room: false,
		storyName: "",
		myVote: "",
		members: { voters: [], observers: [], disconnected: [] },
		votes: [],
		voteCount: 0,
		voteAverage: null,
		votesRevealed: false,
		votedNames: [],
		groupedVoterNames: [],
		nearestPointAverage: null,
		refinementFinished: false,
		votingSystem: "Points",
	},
	mutations: {
		// Local state.
		nickname( state, nickname ) {
			state.nickname = nickname;
		},
		myVote( state, vote ) {
			state.myVote = vote;
		},
		observe( state, observer ) {
			state.observer = observer;
		},
		// Server state.
		SOCKET_DISCONNECT( state ) {
			state.connected = false;
			state.loading = true;
		},
		SOCKET_CONNECT( state ) {
			state.connected = true;
		},
		SOCKET_WELCOME( state ) {
			state.loading = false;
		},
		SOCKET_POINTS( state, points ) {
			state.points = points;
		},
		SOCKET_JOINED( state, room ) {
			state.room = room;
		},
		SOCKET_MEMBERLIST( state, members ) {
			state.members = members;
		},
		SOCKET_STORY( state, data ) {
			state.storyName = data.name;
			state.votingSystem = data.votingSystem;
		},
		SOCKET_VOTES( state, data ) {
			state.votes = sortVotes( data.votes, state.points );
			state.votesRevealed = data.votesRevealed;
			state.voteCount = data.voteCount;
			state.votedNames = data.votedNames || [];
			state.groupedVoterNames = data.groupedVoterNames || [];
			state.nearestPointAverage = data.nearestPointAverage;
			state.voteAverage = data.voteAverage;
			state.votesRevealed = data.votesRevealed;
		},
		SOCKET_FINISHED( state ) {
			state.refinementFinished = true;
		},
	},
} );
