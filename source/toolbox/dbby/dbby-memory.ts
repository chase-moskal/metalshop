
import {DbbyTable, DbbyConditions} from "./types.js"

export function dbbyMemory<Row extends {}>(): DbbyTable<Row> {
	let table: Row[] = []

	function select(conditions: DbbyConditions<Row>): Row[] {
		const filterRow = (row: Row) => filterRowByConditions(row, conditions)
		return table.filter(filterRow)
	}

	return {

		async create(row) {
			table.push(copy(row))
		},

		async read(conditions = {}, {max = 1000, offset = 0} = {}) {
			return copy(select(conditions).slice(offset * max, offset + max))
		},

		async update(conditions, update) {
			const rows = select(conditions)
			for (const row of rows) {
				for (const [key, value] of Object.entries(update))
					row[key] = value
			}
		},

		async delete(conditions) {
			const flippedFilterRow = (row: Row) => !filterRowByConditions(row, conditions)
			table = table.filter(flippedFilterRow)
		},

		async count(conditions = {}) {
			return select(conditions).length
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

function filterRowByConditions<Row extends {}>(
		row: Row,
		conditions: DbbyConditions<Row>,
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
