/* eslint-disable require-jsdoc */
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import VueSocketIOExt from "vue-socket.io-extended";
import storeConfig from "./store";
import websocket from "./websocket";

Vue.use( Vuex );

const store = new Vuex.Store( storeConfig );

Vue.use(
	VueSocketIOExt,
	websocket,
	{ store }
);

// eslint-disable-next-line no-new
new Vue( {
	el: "#v-app",
	render: h => h( App ),
	store,
} );
