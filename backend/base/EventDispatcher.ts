type Event = {
	[ identifier: string ]: CallableFunction;
}

export interface EventDispatcherInterface {
	/**
	 * Base "on" method to add a listener for an event.
	 *
	 * @param {string} event The event being fired.
	 * @param {CallableFunction} callback The callback to use on the event.
	 */
	on( event: string, callback: CallableFunction ): void;

	/**
	 * Dispatches an event.
	 *
	 * @param {string} event   The event identifier.
	 * @param {any}    context Optional. Context of the event.
	 *
	 * @returns {void}
	 */
	dispatch( event: string, context?: any ): void;
}

/**
 * Event Dispatcher.
 */
export default class EventDispatcher implements EventDispatcherInterface {
	private readonly events: Event[] = [];

	/**
	 * Hooks a function onto an event.
	 *
	 * @param {string} event The event to hook onto.
	 * @param {CallableFunction} callback The method that needs to be executed on the event.
	 *
	 * @returns {void}
	 */
	public on( event: string, callback: CallableFunction ): void {
		this.events[ event ] = this.events[ event ] || [];
		this.events[ event ].push( callback );
	}

	/**
	 * Removes a function from an event.
	 *
	 * @param {string} event The event to unhook from.
	 * @param {CallableFunction} callback The method that was registered with `on`.
	 *
	 * @returns {void}
	 */
	public off( event: string, callback: CallableFunction ): void {
		if ( ! this.events[ event ] ) {
			return;
		}

		this.events[ event ] = this.events[ event ].filter( ( registered: CallableFunction ) => registered !== callback );
	}

	/**
	 * Dispatches an event.
	 *
	 * @param {string} event   The event identifier.
	 * @param {any}    context Optional. Context of the event.
	 *
	 * @returns {void}
	 */
	public dispatch( event: string, context?: any ): void {
		if ( ! this.events[ event ] ) {
			return;
		}

		this.events[ event ].map( ( callback: CallableFunction ): void => {
			callback( context );
		} );
	}
}
