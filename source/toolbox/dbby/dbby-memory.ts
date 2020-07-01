
import {DbbyTable, DbbyConditions, DbbyMultiConditional, DbbyConditional, DbbySingleConditional} from "./types.js"

export function dbbyMemory<Row extends {}>(): DbbyTable<Row> {
	let table: Row[] = []

	function select(conditional: DbbyConditional<Row>): Row[] {
		const filterRow = (row: Row) => rowVersusConditional(row, conditional)
		return table.filter(filterRow)
	}

	return {

		async create(row) {
			table.push(copy(row))
		},

		async read({max = 1000, offset = 0, ...conditional}) {
			return copy(select(conditional).slice(offset * max, offset + max))
		},

		async update({replace, ...conditional}) {
			const rows = select(conditional)
			for (const row of rows) {
				for (const [key, value] of Object.entries(replace))
					row[key] = value
			}
		},

		async delete(conditional) {
			const flippedFilterRow = (row: Row) => !rowVersusConditional(row, conditional)
			table = table.filter(flippedFilterRow)
		},

		async count(conditional) {
			return select(conditional).length
		}
	}
}

function copy<T>(x: T): T {
	return JSON.parse(JSON.stringify(x))
}

function compare<Row>(
		row: Row,
		conditional: Partial<Row>,
		evaluator: (a: any, b: any) => boolean,
	) {

	let failures = 0

	for (const [key, value] of Object.entries(conditional)) {
		if (!evaluator(row[key], value))
			failures += 1
	}

	return !failures
}

function rowVersusConditional<Row extends {}>(
		row: Row,
		conditional: DbbyConditional<Row>,
	): boolean {

	// evaluate multi conditional
	if ((<DbbyMultiConditional<Row>>conditional).multi) {
		const multipleConditional = <DbbyMultiConditional<Row>>conditional
		const and = multipleConditional.multi === "and"
		let finalResult = and
		for (const conditions of multipleConditional.conditions) {
			const result = rowVersusConditions<Row>(row, conditions)
			finalResult = and
				? finalResult && result
				: finalResult || result
		}
		return finalResult
	}

	// evaluate single conditional
	else if ((<DbbySingleConditional<Row>>conditional).conditions) {
		const singleConditional = <DbbySingleConditional<Row>>conditional
		return rowVersusConditions<Row>(row, singleConditional.conditions)
	}

	// no conditions
	else return true
}

function rowVersusConditions<Row extends {}>(
		row: Row,
		conditions: DbbyConditions<Row>
	): boolean {

	if (!Object.keys(conditions).length) return true

	let failures = 0

	const check = (
			conditional: Partial<Row>,
			evaluator: (a: any, b: any) => boolean
		) => {
		if (conditional && !compare(row, conditional, evaluator))
			failures += 1
	}

	check(conditions.equal, (a, b) => a === b)
	check(conditions.truthy, a => !!a)
	check(conditions.falsy, a => !a)
	check(conditions.greater, (a, b) => a > b)
	check(conditions.less, (a, b) => a < b)
	check(conditions.includes, (a, b) => !!a.includes && a.includes(b))

	return !failures
}
