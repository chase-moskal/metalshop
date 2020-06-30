
export interface DbbyConditions<Row extends {}> {
	equal?: Partial<Row>
	truthy?: Partial<Row>
	falsy?: Partial<Row>
	less?: Partial<Row>
	greater?: Partial<Row>
	includes?: Partial<Row>
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
