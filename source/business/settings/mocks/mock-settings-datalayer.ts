
import {Settings} from "../../../interfaces.js"
import {SettingsDatalayer, SettingsMaker} from "../interfaces.js"

export function mockSettingsDatalayer({makeDefaultSettings}: {
		makeDefaultSettings: SettingsMaker
	}): SettingsDatalayer {

	const data = {
		records: <Settings[]>[]
	}

	function find(userId: string) {
		return data.records.find(r => r.userId === userId)
	}

	function remove(userId: string) {
		data.records = data.records.filter(r => r.userId !== userId)
	}

	function insert(record: Settings) {
		data.records.push(record)
	}

	return {

		async getOrCreateSettings(userId) {
			let record = find(userId)
			if (!record) {
				record = makeDefaultSettings(userId)
				insert(record)
			}
			return record
		},

		async saveSettings(settings: Settings) {
			remove(settings.userId)
			insert(settings)
		},
	}
}
