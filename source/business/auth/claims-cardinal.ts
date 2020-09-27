
import {and} from "../../toolbox/dbby/dbby-helpers.js"
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {User, ClaimsRow, ClaimsCardinalTopic} from "../../types.js"

export function makeClaimsCardinal<U extends User>({claimsTable}: {
		claimsTable: DbbyTable<ClaimsRow>
	}): ClaimsCardinalTopic<U> {
	return {

		async writeClaims({userId, claims}) {
			await claimsTable.update({
				conditions: and({equal: {userId}}),
				write: claims,
			})
		},
	}
}
