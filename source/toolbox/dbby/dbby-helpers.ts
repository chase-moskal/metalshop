
import {DbbyRow, DbbyConditionHelper} from "./dbby-types.js"

export function curryDbbyHelpers<Row extends DbbyRow>(): {
		and: DbbyConditionHelper<Row>
		or: DbbyConditionHelper<Row>
	} {
	return {
		and: (...conditions) => ["and", ...conditions],
		or: (...conditions) => ["or", ...conditions],
	}
}
