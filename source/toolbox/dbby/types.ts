
export type DbbyValue =
	| undefined
	| boolean
	| number
	| string
	| bigint

export type DbbyRow<T extends {} = {}> = {
	[P in keyof T]: DbbyValue
}

export interface DbbyConditions<Row extends DbbyRow> {
	equal?: Partial<Row>
	truthy?: Partial<Row>
	falsy?: Partial<Row>
	less?: Partial<Row>
	lessy?: Partial<Row>
	greater?: Partial<Row>
	greatery?: Partial<Row>
	includes?: Partial<Row>

	notEqual?: Partial<Row>
	notTruthy?: Partial<Row>
	notFalsy?: Partial<Row>
	notLess?: Partial<Row>
	notLessy?: Partial<Row>
	notGreater?: Partial<Row>
	notGreatery?: Partial<Row>
	notIncludes?: Partial<Row>
}

export interface DbbyNonConditional {
	conditions: false | null
}

export interface DbbySingleConditional<Row extends DbbyRow> {
	conditions: DbbyConditions<Row>
}

export interface DbbyMultiConditional<Row extends DbbyRow> {
	multi: "and" | "or"
	conditions: DbbyConditions<Row>[]
}

export type DbbyUpsert<Row extends DbbyRow> = DbbyConditional<Row> & {upsert: Row}
export type DbbyWrite<Row extends DbbyRow> = DbbyConditional<Row> & {write: Partial<Row>}
export type DbbyWhole<Row extends DbbyRow> = DbbyConditional<Row> & {whole: Row}
export type DbbyUpdate<Row extends DbbyRow> = DbbyWrite<Row> | DbbyWhole<Row> | DbbyUpsert<Row>
export type DbbyUpdateAmbiguated<Row extends DbbyRow> = DbbyWrite<Row> & DbbyWhole<Row> & DbbyUpsert<Row>

export type DbbyConditional<Row extends DbbyRow> =
	| DbbySingleConditional<Row>
	| DbbyMultiConditional<Row>
	| DbbyNonConditional

export type DbbyPaginated<Row extends DbbyRow> = DbbyConditional<Row> & {
	max?: number
	offset?: number
}

export type DbbyAssertion<Row extends DbbyRow> = DbbyConditional<Row> & {
	make: () => Promise<Row>
}

export interface DbbyTable<Row extends DbbyRow> {
	create(row: Row): Promise<void>
	read(options: DbbyPaginated<Row>): Promise<Row[]>
	one(options: DbbyConditional<Row>): Promise<Row>
	assert(options: DbbyAssertion<Row>): Promise<Row>
	update(options: DbbyUpdate<Row>): Promise<void>
	delete(options: DbbyConditional<Row>): Promise<void>
	count(options: DbbyConditional<Row>): Promise<number>
}
