import { Injectable } from "@nestjs/common";
import PointProviderFactory from "./PointProviderFactory";
import { PointProviderInterface } from "./PointProviderInterface";
import { VotingSystem } from "./VotingSystem";

@Injectable()
/**
 * The VoteValidationService.
 */
export default class VoteValidationService {
	/**
	 * The VoteValidationService constructor.
	 *
	 * @param {PointProviderFactory} pointProviderFactory A factory that constructs the right PointProvider class depending on the used voting system.
	 */
	public constructor( private readonly pointProviderFactory: PointProviderFactory ) {
	}

	/**
	 * Checks if a cast vote is a valid vote option.
	 *
	 * @param {VotingSystem} votingSystem The voting system to validate the vote for.
	 * @param {any} vote The vote input to validate.
	 *
	 * @returns {boolean} Whether the vote is valid.
	 */
	public isValid( votingSystem: VotingSystem, vote: any ) {
		const pointProvider: PointProviderInterface = this.pointProviderFactory.getPointProvider( votingSystem );
		return pointProvider.getPoints().includes( vote );
	}
}
