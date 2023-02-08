/**
 * Sorts a list of cast votes in the same order as the list of available points.
 *
 * @param {Vote[]} votes A list of cast votes to sort.
 * @param {(string|number)[]} availablePoints An array of available points to cast.
 *
 * @returns {Vote[]} A sorted vote array.
 */
export function sortVotes( votes, availablePoints ) {
	// If we don't have available points yet, return early.
	if ( ! availablePoints.length ) {
		return votes;
	}

	/*
	 * Create a map of the index of each available point.
	 * For example:
	 * {
	 *    0: 0
	 *    0.5: 1
	 *    1: 2
	 *    2: 3
	 *    3: 4
	 *    5: 5
	 *    8: 6
	 *    13: 7
	 *    21: 8
	 *    100: 9
	 *    "?": 10
	 *    coffee: 11
	 * }
	 */
	const indexedPoints = availablePoints.reduce( ( acc, currentValue, index ) => {
		return { ...acc, [ currentValue ]: index };
	}, {} );

	return votes.sort( ( a, b ) => {
		// If the votes are equal, sort based on the initial vote.
		if ( a.currentValue === b.currentValue ) {
			return indexedPoints[ a.initialValue ] - indexedPoints[ b.initialValue ];
		}

		return indexedPoints[ a.currentValue ] - indexedPoints[ b.currentValue ];
	} );
}
