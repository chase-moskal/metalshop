
import * as renraku from "renraku"
import {AuthExchangerApi} from "./interfaces.js"

export const authExchangerApiShape: renraku.ApiShape<AuthExchangerApi> = {
	authExchanger: {
		authorize: true,
		authenticateViaGoogle: true
	}
}
