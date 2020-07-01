
import {first} from "./first.js"
import {DbbyTable, DbbyConditions, DbbyMultiConditional, DbbyConditional, DbbySingleConditional, DbbyReplace, DbbyUpsert} from "./types.js"

export function dbbyMemory<Row extends {}>(): DbbyTable<Row> {
	let table: Row[] = []

	function select(conditional: DbbyConditional<Row>): Row[] {
		const filterRow = (row: Row) => rowVersusConditional(row, conditional)
		return table.filter(filterRow)
	}

	function selectOne(conditional: DbbyConditional<Row>): Row {
		const filterRow = (row: Row) => rowVersusConditional(row, conditional)
		return table.find(filterRow)
	}

	function updateRow(rows: Row[], update: Partial<Row>) {
		for (const row of rows)
			for (const [key, value] of Object.entries(update))
				row[key] = value
	}

	function insertCopy(row: Row) {
		table.push(copy(row))
	}

	return {

		async create(row) {
			insertCopy(row)
		},

		async read({max = 1000, offset = 0, ...conditional}) {
			return copy(select(conditional).slice(offset * max, offset + max))
		},

		async one(conditional) {
			return copy(selectOne(conditional))
		},

		async update({replace, upsert, ...conditional}: DbbyReplace<Row> & DbbyUpsert<Row>) {
			const rows = select(conditional)
			if (replace) updateRow(rows, replace)
			else if (upsert) {
				if (rows.length) updateRow(rows, upsert)
				else insertCopy(upsert)
			}
			else throw new Error("invalid update")
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
	check(conditions.greatery, (a, b) => a >= b)
	check(conditions.less, (a, b) => a < b)
	check(conditions.lessy, (a, b) => a <= b)
	check(conditions.includes, (a, b) => !!a.includes && a.includes(b))

	check(conditions.notEqual, (a, b) => !(a === b))
	check(conditions.notTruthy, a => !(!!a))
	check(conditions.notFalsy, a => !(!a))
	check(conditions.notGreater, (a, b) => !(a > b))
	check(conditions.notGreatery, (a, b) => !(a >= b))
	check(conditions.notLess, (a, b) => !(a < b))
	check(conditions.notLessy, (a, b) => !(a <= b))
	check(conditions.notIncludes, (a, b) => !(!!a.includes && a.includes(b)))

	return !failures
}
