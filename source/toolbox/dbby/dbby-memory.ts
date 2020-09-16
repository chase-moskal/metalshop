
import {evaluateConditional} from "./dbby-common.js"

import {DbbyTable, DbbyRow, DbbyCond, DbbyConditional, DbbyUpdateAmbiguated, DbbyStorage} from "./dbby-types.js"

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

		async create(...rows) {
			for (const row of rows) insertCopy(row)
			save()
		},

		async read({order, offset = 0, limit = 1000, ...conditional}) {
			const rows = copy(select(conditional))
			if (order) {
				for (const [key, value] of Object.entries(order)) {
					rows.sort((a, b) =>
						value === "ascend"
							? a[key] > b[key] ? 1 : -1
							: a[key] > b[key] ? -1 : 1
					)
				}
			}
			return rows.slice(offset, offset + limit)
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
			if (write && rows.length) {
				updateRow(rows, write)
			}
			else if (upsert) {
				if (rows.length) updateRow(rows, upsert)
				else insertCopy(upsert)
			}
			else if (whole) {
				eliminateRow(conditional)
				insertCopy(whole)
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
	const {
		nonConditional,
		multiConditional,
		singleConditional,
	} = evaluateConditional(conditional)

	if (nonConditional) {
		return true
	}
	else if (singleConditional) {
		return rowVersusConditions<Row>(row, singleConditional.conditions)
	}
	else if (multiConditional) {
		const and = multiConditional.multi === "and"
		let finalResult = and
		for (const conditions of multiConditional.conditions) {
			const result = rowVersusConditions<Row>(row, conditions)
			finalResult = and
				? finalResult && result
				: finalResult || result
		}
		return finalResult
	}
	else throw new Error("failed conditional evaluation")
}

function rowVersusConditions<Row extends {}>(
		row: Row,
		conditions: DbbyCond<Row>
	): boolean {

	if (!Object.keys(conditions).length) return true

	let failures = 0

	type Evaluator = (a: any, b: any) => boolean

	const check = (
			conditions: Partial<{[P in keyof Row]: any}>,
			evaluator: Evaluator
		) => {
		if (conditions && !compare(row, conditions, evaluator))
			failures += 1
	}

	const checks: {[key: string]: Evaluator} = {
		set: a => a !== undefined && a !== null,
		equal: (a, b) => a === b,
		greater: (a, b) => a > b,
		greatery: (a, b) => a >= b,
		less: (a, b) => a < b,
		lessy: (a, b) => a <= b,
		listed: (a, b) => a.includes(b),
		search: (a, b) => typeof b === "string" ? a.includes(b) : b.test(a),
	}

	function not(evaluator: Evaluator): Evaluator {
		return (a, b) => !evaluator(a, b)
	}

	check(conditions.set, checks.set)
	check(conditions.equal, checks.equal)
	check(conditions.greater, checks.greater)
	check(conditions.greatery, checks.greatery)
	check(conditions.less, checks.less)
	check(conditions.lessy, checks.lessy)
	check(conditions.listed, checks.listed)
	check(conditions.search, checks.search)
	
	check(conditions.notSet, not(checks.set))
	check(conditions.notEqual, not(checks.equal))
	check(conditions.notGreater, not(checks.greater))
	check(conditions.notGreatery, not(checks.greatery))
	check(conditions.notLess, not(checks.less))
	check(conditions.notLessy, not(checks.lessy))
	check(conditions.notListed, not(checks.listed))
	check(conditions.notSearch, not(checks.search))

	return !failures
}
