
export interface DbbyConditions<Row extends {}> {
	equal?: Partial<Row>
	truthy?: Partial<Row>
	falsy?: Partial<Row>
	less?: Partial<Row>
	greater?: Partial<Row>
	includes?: Partial<Row>
}

export interface DbbyReadOptions {
	max?: number
	offset?: number
}

export interface DbbyTable<Row extends {}> {
	create(row: Row): Promise<void>
	read(conditions?: DbbyConditions<Row>, options?: DbbyReadOptions): Promise<Row[]>
	update(conditions: DbbyConditions<Row>, update: Partial<Row>): Promise<void>
	delete(conditions: DbbyConditions<Row>): Promise<void>
	count(conditions?: DbbyConditions<Row>): Promise<number>
}
