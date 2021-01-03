/* eslint-disable require-jsdoc */
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import VueSocketIO from "vue-socket.io";

Vue.use( Vuex );

Vue.use( new VueSocketIO( {
	debug: false,
	// @todo figure out how to read the env variable.
	connection: window.location.protocol + "//" + window.location.hostname + ":3050" + window.location.pathname + "pokers",
} ) );

const store = new Vuex.Store( {
	state: {
		loading: true,
		refinementFinished: false,
		nickname: "", // Required globally because of socket calls.
		activePoker: false, // Required globally because of socket calls.
		points: {},
		observer: false,
		pointSpread: null,
		currentStory: { name: "", nearestPointAverage: "", voteAverage: "" },
		myVote: "",
		members: { voters: [], observers: [], disconnected: [] },
		votes: [],
		voteCount: 0,
		votedNames: [],
		groupedVoterNames: [],
	},
	mutations: {
		loadingFinished( state ) {
			state.loading = false;
		},
		refinementFinished( state, finished ) {
			state.refinementFinished = finished;
		},
		activePoker( state, activePoker ) {
			state.activePoker = activePoker;
		},
		pointSpread( state, spread ) {
			state.pointSpread = spread;
		},
		voteCount( state, votes ) {
			state.voteCount = votes;
		},
		members( state, members ) {
			state.members = members;
		},
		observe( state, observer ) {
			state.observer = observer;
		},
		points( state, points ) {
			state.points = points;
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
		currentStory( state, story ) {
			state.currentStory = story;
		},
		votes( state, votes ) {
			state.votes = votes;
		},
		votedNames( state, votedNames ) {
			state.votedNames = votedNames;
		},
		groupedVoterNames( state, groupedVoterNames ) {
			state.groupedVoterNames = groupedVoterNames;
		},
		myVote( state, vote ) {
			state.myVote = vote;
		},
	},
} );

// eslint-disable-next-line no-new
new Vue( {
	el: "#v-app",
	render: h => h( App ),
	store,
} );
