
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

export type DbbyConditional<Row extends {}> =
	| DbbySingleConditional<Row>
	| DbbyMultiConditional<Row>
	| DbbyNonConditional

export interface DbbyTable<Row extends {}> {
	create(row: Row): Promise<void>
	read(options: DbbyConditional<Row> & {
			max?: number
			offset?: number
		}): Promise<Row[]>
	update(options: DbbyConditional<Row> & {
			replace: Partial<Row>
		}): Promise<void>
	delete(options: DbbyConditional<Row>): Promise<void>
	count(options: DbbyConditional<Row>): Promise<number>
}
