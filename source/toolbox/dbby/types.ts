
export interface DbbyConditions<Row extends {}> {
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

export interface DbbySingleConditional<Row extends {}> {
	conditions: DbbyConditions<Row>
}

export interface DbbyMultiConditional<Row extends {}> {
	multi: "and" | "or"
	conditions: DbbyConditions<Row>[]
}

export type DbbyUpsert<Row extends {}> = DbbyConditional<Row> & {upsert: Row}
export type DbbyReplace<Row extends {}> = DbbyConditional<Row> & {replace: Partial<Row>}

export type DbbyConditional<Row extends {}> =
	| DbbySingleConditional<Row>
	| DbbyMultiConditional<Row>
	| DbbyNonConditional

export type DbbyPaginated<Row extends {}> = DbbyConditional<Row> & {
	max?: number
	offset?: number
}

export interface DbbyTable<Row extends {}> {
	create(row: Row): Promise<void>
	read(options: DbbyPaginated<Row>): Promise<Row[]>
	one(options: DbbyConditional<Row>): Promise<Row>
	update(options: DbbyReplace<Row> | DbbyUpsert<Row>): Promise<void>
	delete(options: DbbyConditional<Row>): Promise<void>
	count(options: DbbyConditional<Row>): Promise<number>
}
