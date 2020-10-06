
import {NicknameStructure} from "../../types.js"
import {Rando} from "../../toolbox/get-rando.js"
import * as dictionaries from "../../toolbox/nickname-dictionaries.js"

export function curryGenerateNickname({rando, nicknameStructure, delimiter}: {
		rando: Rando
		delimiter: string
		nicknameStructure: NicknameStructure
	}) {
	const nicknameData = nicknameStructure.map(
		dictionarySet => dictionarySet.reduce(
			(previous, dictionaryName) => [
				...previous,
				...dictionaries[dictionaryName],
			],
			<string[]>[]
		)
	)
	return () => nicknameData
		.map(names => rando.randomSample(names))
		.join(delimiter)
}
