
// import {} from "./types.js"
// import {isUserAdmin} from "./is-user-admin.js"
// import * as convertUserRecord from "../auth/convert-user-record.js"
// import {StatisticianTopic, SystemStats, User, AccessToken, VerifyToken, BillingTable, AccessPayload, Profile, Persona, UserTable, ProfileTable} from "../../interfaces.js"

// import {authorizeForStats} from "./authorizers.js"

// export function makeStatistician({
// 		userTable,
// 		verifyToken,
// 		profileTable,
// 		billingTable,
// 	}: {
// 		userTable: UserTable
// 		verifyToken: VerifyToken
// 		billingTable: BillingTable
// 		profileTable: ProfileTable
// 	}): StatisticianTopic {

// 	return {
// 		async fetchStats({accessToken}) {
// 			const {user} = await verifyToken<AccessPayload>(accessToken)
// 			if (!authorizeForStats) throw new Error("not authorized for stats")

// 			return {
// 				userCount: await userTable.count({conditions: {}}),
// 				adminCount: (await userTable.read({})).length
// 			}
// 		},
// 	}
// }

