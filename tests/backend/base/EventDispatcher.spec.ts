import EventDispatcher from "../../../backend/src/base/EventDispatcher";

describe( "EventDispatcher", () => {
	let eventDispatcher: EventDispatcher;

	beforeEach( () => {
		eventDispatcher = new EventDispatcher();
	} );

	describe( "dispatch", () => {
		it( "dispatches a registered event", () => {
			const callback = jest.fn();

			eventDispatcher.on( "event", callback );
			eventDispatcher.dispatch( "event" );

			expect( callback ).toBeCalledTimes( 1 );
		} );

		it( "dispatches multiple registered callbacks for an event", () => {
			const callback = jest.fn();
			const callback2 = jest.fn();
			const callback3 = jest.fn();

			eventDispatcher.on( "event", callback );
			eventDispatcher.on( "event", callback2 );
			eventDispatcher.on( "event", callback3 );

			eventDispatcher.dispatch( "event" );

			expect( callback ).toBeCalledTimes( 1 );
			expect( callback2 ).toBeCalledTimes( 1 );
			expect( callback3 ).toBeCalledTimes( 1 );
		} );

		it( "dispatches a registered event with arguments", () => {
			const callback = jest.fn();

			eventDispatcher.on( "event", callback );
			eventDispatcher.dispatch( "event", "2" );

			expect( callback ).toBeCalledWith( "2" );
			expect( callback ).toBeCalledTimes( 1 );
		} );

		it( "dispatches nothing with no events", () => {
			eventDispatcher.dispatch( "event" );
		} );

		it( "dispatches nothing with other events", () => {
			const callback = jest.fn();

			eventDispatcher.on( "event1", callback );
			eventDispatcher.dispatch( "event2" );

			expect( callback ).not.toHaveBeenCalled();
		} );
	} );
} );
