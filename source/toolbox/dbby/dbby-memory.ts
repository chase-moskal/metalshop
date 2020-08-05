
import {DbbyTable, DbbyRow, DbbyConditions, DbbyMultiConditional, DbbyConditional, DbbySingleConditional, DbbyUpdateAmbiguated, DbbyStorage} from "./types.js"

export function dbbyMemory<Row extends DbbyRow>({
		dbbyStorage,
	}: {
		dbbyStorage?: DbbyStorage<Row>
	} = {}): DbbyTable<Row> {

	let table: Row[] = dbbyStorage
		? dbbyStorage.load() || []
		: []

	function save() {
		if (dbbyStorage) dbbyStorage.save(table)
	}

	function select(conditional: DbbyConditional<Row>): Row[] {
		return table.filter(row => rowVersusConditional(row, conditional))
	}

	function selectOne(conditional: DbbyConditional<Row>): Row {
		return table.find(row => rowVersusConditional(row, conditional))
	}

	function updateRow(rows: Row[], update: Partial<Row>) {
		for (const row of rows)
			for (const [key, value] of Object.entries(update))
				row[key] = value
	}

	function insertCopy(row: Row) {
		table.push(copy(row))
	}

	function eliminateRow(conditional: DbbyConditional<Row>) {
		const flippedFilterRow = (row: Row) => !rowVersusConditional(row, conditional)
		table = table.filter(flippedFilterRow)
	}

	return {

		async create(row) {
			insertCopy(row)
			save()
		},

		async read({max = 1000, offset = 0, ...conditional}) {
			return copy(select(conditional).slice(offset * max, offset + max))
		},

		async one(conditional) {
			return copy(selectOne(conditional))
		},

		async assert({make, ...conditional}) {
			let row = copy(selectOne(conditional))
			if (!row) {
				const made = await make()
				insertCopy(made)
				row = copy(made)
				save()
			}
			return row
		},

		async update({write, whole, upsert, ...conditional}: DbbyUpdateAmbiguated<Row>) {
			const rows = select(conditional)
			if (write) {
				if (rows.length) updateRow(rows, write)
				else throw new Error("no row to update")
			}
			else if (whole) {
				eliminateRow(conditional)
				insertCopy(whole)
			}
			else if (upsert) {
				if (rows.length) updateRow(rows, upsert)
				else insertCopy(upsert)
			}
			else throw new Error("invalid update")
			save()
		},

		async delete(conditional) {
			eliminateRow(conditional)
			save()
		},

		async count(conditional) {
			return select(conditional).length
		}
	}
}

function copy<T>(x: T): T {
	if (x === undefined) return undefined
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
