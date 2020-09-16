
import {DbbyTable, DbbyRow, DbbyPaginated} from "./dbby-types.js"

export function dbbyNamespace<Row extends DbbyRow, T extends DbbyTable<Row>>({table, key, value}: {
		table: T
		key: string
		value: string
	}): DbbyTable<Row> {
	return {
		async create(row, ...rows) {
			const augment = (row: Row) => ({...row, [key]: value})
			return table.create(augment(row), ...rows.map(augment))
		},
		async read(options) {
			options.conditions
			const lol = table.read(options)
			throw new Error("todo implement")
		},
		async one(options) {
			throw new Error("todo implement")
		},
		async assert(options) {
			throw new Error("todo implement")
		},
		async update(options) {
			throw new Error("todo implement")
		},
		async delete(options) {
			throw new Error("todo implement")
		},
		async count(options) {
			throw new Error("todo implement")
		},
	}
}

//
// ideas
//

interface Dbby2<Row extends DbbyRow> {
	create(...rows: Row[]): Promise<void>
	read(options: DbbyPaginated<Row>): Promise<Row[]>
	update(options: {}): Promise<void>
	delete(options: {}): Promise<void>
	count(options: {}): Promise<void>

	// fancies
	one(): Promise<Row>
	assert(): Promise<Row>
}

const table = (<any>"magic dbby")()

export const and = (...conds: any[]) => ["and", ...conds]
export const or = (...conds: any[]) => ["or", ...conds]

// TODO this is what usage should be like
const rows = await table.read({
	conditions: and(
		{equal: {userId: "u123"}},
		or({equal: {appId: "a534"}}, {equal: {superuser: true}}),
	)
})
