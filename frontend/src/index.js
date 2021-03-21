/* eslint-disable require-jsdoc */
import Vue from "vue";
import Index from "./Index.vue";
import VueSocketIOExt from "vue-socket.io-extended";
import store from "./services/store";
import websocket from "./services/websocket";

Vue.use(
	VueSocketIOExt,
	websocket,
	{ store }
);

// eslint-disable-next-line no-new
new Vue( {
	el: "#v-app",
	render: h => h( Index ),
	store,
} );
