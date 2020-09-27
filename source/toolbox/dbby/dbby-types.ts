
export type DbbyValue =
	| undefined
	| boolean
	| number
	| string
	| bigint

export type DbbyRow<T extends {[key: string]: DbbyValue} = {}> = T

//
//
//

export interface DbbyCondition<Row extends DbbyRow> {
	set?: Partial<{[P in keyof Row]: true}>
	equal?: Partial<Row>
	less?: Partial<Row>
	lessy?: Partial<Row>
	greater?: Partial<Row>
	greatery?: Partial<Row>
	listed?: Partial<Row>
	search?: Partial<{[P in keyof Row]: string | RegExp}>

	notSet?: Partial<{[P in keyof Row]: true}>
	notEqual?: Partial<Row>
	notLess?: Partial<Row>
	notLessy?: Partial<Row>
	notGreater?: Partial<Row>
	notGreatery?: Partial<Row>
	notListed?: Partial<Row>
	notSearch?: Partial<{[P in keyof Row]: string | RegExp}>
}

export type DbbyConditionTree<Row extends DbbyRow> =
	["and", ...(DbbyCondition<Row> | DbbyConditionTree<Row>)[]]
	| ["or", ...(DbbyCondition<Row> | DbbyConditionTree<Row>)[]]

//
//
//

export interface DbbyConditional<Row extends DbbyRow> {
	conditions: false | DbbyConditionTree<Row>
}

export type DbbyOrder<Row extends DbbyRow> = Partial<{
	[P in keyof Row]: "ascend" | "descend" | undefined
}>

export type DbbyPaginated<Row extends DbbyRow> = DbbyConditional<Row> & {
	limit?: number
	offset?: number
	order?: DbbyOrder<Row>
}
export type DbbyUpsert<Row extends DbbyRow> = DbbyConditional<Row> & {upsert: Row}
export type DbbyWrite<Row extends DbbyRow> = DbbyConditional<Row> & {write: Partial<Row>}
export type DbbyWhole<Row extends DbbyRow> = DbbyConditional<Row> & {whole: Row}
export type DbbyUpdate<Row extends DbbyRow> = DbbyWrite<Row> | DbbyWhole<Row> | DbbyUpsert<Row>
export type DbbyUpdateAmbiguated<Row extends DbbyRow> = DbbyWrite<Row> & DbbyWhole<Row> & DbbyUpsert<Row>
export type DbbyAssertion<Row extends DbbyRow> = DbbyConditional<Row> & {
	make: () => Promise<Row>
}

//
//
//

export type DbbyConditionHelper<Row extends DbbyRow> = (
	...conditions: DbbyCondition<Row>[]
) => DbbyConditionTree<Row>

export interface DbbyTable<Row extends DbbyRow> {
	create(row: Row, ...args: DbbyRow<Row>[]): Promise<void>
	read(options: DbbyPaginated<DbbyRow<Row>>): Promise<DbbyRow<Row>[]>
	one(options: DbbyConditional<DbbyRow<Row>>): Promise<DbbyRow<Row>>
	assert(options: DbbyAssertion<DbbyRow<Row>>): Promise<DbbyRow<Row>>
	update(options: DbbyUpdate<DbbyRow<Row>>): Promise<void>
	delete(options: DbbyConditional<DbbyRow<Row>>): Promise<void>
	count(options: DbbyConditional<DbbyRow<Row>>): Promise<number>
	and: DbbyConditionHelper<Row>
	or: DbbyConditionHelper<Row>
}

export interface DbbyStorage<Row extends DbbyRow> {
	save(table: Row[]): void
	load(): Row[]
}
