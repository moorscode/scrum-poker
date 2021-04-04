import io from "socket.io-client";

export default io(
	window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "" + window.location.pathname + "pokers",
	{
		reconnection: true,
		reconnectionDelay: 750,
		reconnectionAttempts: Infinity,
		autoConnect: false,
	},
);
