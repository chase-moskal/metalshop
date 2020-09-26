
import {DbbyConditionTree, DbbyCondition, DbbyRow} from "./dbby-types.js"

export function and<C extends any[]>(...conditions: C): ["and", ...C[]] {
	return ["and", ...conditions]
}

export function or<Row extends DbbyRow>(...conditions: DbbyCondition<Row>[]) {
	return ["or", ...conditions]
}

// export type CondOp<Row extends DbbyRow> = (...conditions: DbbyCondition<Row>[]) => DbbyConditionTree<Row>

// export function cond<Row extends DbbyRow>(
// 		builder: (o: {and: CondOp<Row>, or: CondOp<Row>}) => DbbyConditionTree<Row>
// 	) {
// 	return {
// 		conditions: builder({and, or})
// 	}
// }

// export const cond2 = Object.freeze({
// 	and: <Row extends DbbyRow>(...conds: DbbyCondition<Row>[]) => ({
// 		conditions: and(...conds)
// 	}),
// 	or: <Row extends DbbyRow>(...conds: DbbyCondition<Row>[]) => ({
// 		conditions: or(...conds)
// 	}),
// })

// export function find<Row extends DbbyRow>() {
// 	return {
// 		and: (...conds: DbbyCondition<Row>[]) => ({
// 			conditions: and(...conds)
// 		}),
// 		or: (...conds: DbbyCondition<Row>[]) => ({
// 			conditions: or(...conds)
// 		}),
// 	}
// }
