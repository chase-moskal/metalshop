
import {DbbyConditional, DbbyMultiConditional, DbbySingleConditional, DbbyNonConditional} from "./dbby-types.js"

export function evaluateConditional<Row>(conditional: DbbyConditional<Row>) {
	const non = !conditional.conditions
	const multi = !!(<any>conditional).multi
	return {
		nonConditional: non ? <DbbyNonConditional>conditional : undefined,
		multiConditional: multi ? <DbbyMultiConditional<Row>>conditional : undefined,
		singleConditional: multi ? undefined : <DbbySingleConditional<Row>>conditional,
	}
}
