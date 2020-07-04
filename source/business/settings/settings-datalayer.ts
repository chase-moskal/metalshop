
import {makeDefaultSettings} from "./default-settings.js"
import {SettingsDatalayer, SettingsRecord, SettingsTable} from "../../interfaces.js"

export function makeSettingsDatalayer({settingsTable}: {
		settingsTable: SettingsTable
	}): SettingsDatalayer {

	return {

		async getRecord(userId: string): Promise<SettingsRecord> {
			return settingsTable.one({conditions: {equal: {userId}}})
		},

		async getOrCreateRecord(userId: string): Promise<SettingsRecord> {
			let record = await settingsTable.one({conditions: {equal: {userId}}})
			if (!record) {
				record = makeDefaultSettings(userId)
				await settingsTable.create(record)
			}
			return record
		},

		async saveRecord(record: SettingsRecord) {
			await settingsTable.update({
				conditions: {equal: {userId: record.userId}},
				upsert: record,
			})
		},
	}
}
