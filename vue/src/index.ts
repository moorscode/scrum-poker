/* eslint-disable require-jsdoc */
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import VueSocketIO from "vue-socket.io";

Vue.use( Vuex );

Vue.use( new VueSocketIO( {
	debug: true,
	connection: window.location.protocol + "//" + window.location.hostname + ":3050" + window.location.pathname + "pokers",
} ) );

const store = new Vuex.Store( {
	state: {
		loading: true,
		refinementFinished: false,
		showMembersList: false,
		nickname: "",
		activePoker: false,
		points: {},
		observer: false,
		showHistory: window.localStorage.getItem( "showHistory" ) === "true",
		pointSpread: null,
		currentStory: { name: "", nearestPointAverage: "", voteAverage: "" },
		// StoryName: "",
		// StoryNameUpdated: false,
		myVote: "",
		// MyInitialVote: "",
		members: { voters: [], observers: [], disconnected: [] },
		votes: [],
		voteCount: 0,
		voteNames: {},
		votedNames: [],
		groupedVoterNames: [],
		// StoryHistory: [],
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
		voteNames( state, voteNames ) {
			state.voteNames = voteNames;
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
