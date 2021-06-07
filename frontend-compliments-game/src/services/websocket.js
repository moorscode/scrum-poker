import io from "socket.io-client";

const server = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/compliments-game";

export default io(
	server,
	{
		reconnection: true,
		reconnectionDelay: 750,
		reconnectionAttempts: Infinity,
		autoConnect: false,
	},
);
