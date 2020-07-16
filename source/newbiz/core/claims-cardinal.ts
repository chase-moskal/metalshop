
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {User, ClaimsRow, ClaimsCardinalTopic} from "../../types.js"

export function makeClaimsCardinal<U extends User>({claimsTable}: {
		claimsTable: DbbyTable<ClaimsRow>
	}): ClaimsCardinalTopic<U> {
	return {

		async writeClaims({userId, claims}) {
			await claimsTable.update({
				conditions: {equal: {userId}},
				write: claims,
			})
		},
	}
}
