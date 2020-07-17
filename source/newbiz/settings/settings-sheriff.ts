
import {DbbyTable} from "../../toolbox/dbby/types.js"
import {SettingsSheriffTopic, SettingsRow, Settings, Authorizer} from "../../types.js"

export function makeSettingsSheriff({settingsTable, authorize}: {
		authorize: Authorizer
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
