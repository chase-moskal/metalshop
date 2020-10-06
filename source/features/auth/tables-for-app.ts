
import {objectMap} from "../../toolbox/object-map.js"
import {DbbyTable, DbbyRow} from "../../toolbox/dbby/dbby-types.js"

import {AppPayload} from "./auth-types.js"

export type GetTableForApp<Row extends DbbyRow> =
	(app: AppPayload) => DbbyTable<Row>

export function tablesForApp<
		T extends {[key: string]: GetTableForApp<DbbyRow>}
	>(app: AppPayload, tables: T): T {
	return objectMap(tables, table => table(app))
}
