
import {DbbyTable} from "../../toolbox/dbby/dbby-types.js"
import {SettingsSheriffTopic, MetalSettings, SettingsRow, Authorizer} from "../../types.js"

export function makeSettingsSheriff<S extends MetalSettings>({settingsTable, authorize}: {
		authorize: Authorizer
		settingsTable: DbbyTable<SettingsRow>
	}): SettingsSheriffTopic<S> {
	const {and} = settingsTable

	async function assertSettings(userId: string): Promise<S> {
		const row = await settingsTable.assert({
			conditions: and({equal: {userId}}),
			make: async() => ({
				userId,
				actAsAdmin: true,
			}),
		})
		return <S>{
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
				conditions: and({equal: {userId}}),
				write: {actAsAdmin},
			})
			return {...settings, actAsAdmin}
		},
	}
}
