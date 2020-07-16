
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {SettingsSheriffTopic, SettingsRow, Settings, VerifyToken, AccessToken, AccessPayload} from "../../types.js"

export function makeSettingsSheriff({settingsTable, verifyToken}: {
		verifyToken: VerifyToken
		settingsTable: DbbyTable<SettingsRow>
	}): SettingsSheriffTopic {

	async function assertSettings(userId: string): Promise<Settings> {
		const row = await settingsTable.assert({
			conditions: {equal: {userId}},
			make: async() => ({
				userId,
				actAsAdmin: true,
			}),
		})
		return {
			actAsAdmin: row.actAsAdmin
		}
	}

	async function authorize(accessToken: AccessToken) {
		const {user, scope} = await verifyToken<AccessPayload>(accessToken)
		if (!scope.core) throw new Error("forbidden scope")
		return user
	}

	return {

		async fetchSettings({accessToken}) {
			const {userId} = await authorize(accessToken)
			return assertSettings(userId)
		},

		async setActAsAdmin({accessToken, actAsAdmin}) {
			const {userId} = await authorize(accessToken)
			const settings = await assertSettings(userId)
			await settingsTable.update({
				conditions: {equal: {userId}},
				write: {actAsAdmin},
			})
			return {...settings, actAsAdmin}
		},
	}
}
