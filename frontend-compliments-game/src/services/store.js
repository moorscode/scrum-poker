import Vue from "vue";
import Vuex from "vuex";

Vue.use( Vuex );

/* eslint-disable require-jsdoc */
export default new Vuex.Store( {
	state: {
		connected: false,
		loading: false,
		room: "",
		nickname: "",
		userId: "",
		game: {
			started: false,
			finished: false,
			members: {},
			cards: [],
		},
		members: [],
		memberIdToName: {},
		memberCount: 0,
		connectedMembers: 0,
		turn: "",
	},
	mutations: {
		nickname( state, nickname ) {
			state.nickname = nickname;
		},
		userId( state, userId ) {
			state.userId = userId;
		},
		// Server state.
		SOCKET_DISCONNECT( state ) {
			state.connected = false;
			state.loading   = true;
		},
		SOCKET_CONNECT( state ) {
			state.connected = true;
		},
		SOCKET_WELCOME( state ) {
			state.loading = false;
		},
		SOCKET_JOINED( state, room ) {
			state.room = room;
		},
		SOCKET_GAME( state, game ) {
			state.game = game;
		},
		SOCKET_TURN( state, userId ) {
			state.turn = userId;
		},
		SOCKET_MEMBERS( state, members ) {
			state.memberCount      = Object.keys( members ).length;
			state.connectedMembers = Object.values( members ).filter( ( member ) => member.connected ).length;
			state.members          = members;

			for ( const [ memberId, member ] of Object.entries( members ) ) {
				state.memberIdToName[ memberId ] = member.name;
			}
		},
	},
} );
