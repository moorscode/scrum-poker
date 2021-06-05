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
		game: {},
	},
	mutations: {
		nickname( state, nickname ) {
			state.nickname = nickname;
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
	},
} );
