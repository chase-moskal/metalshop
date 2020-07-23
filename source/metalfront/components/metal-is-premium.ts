
import {isPremium} from "../../business/core/user-evaluators.js"
import {makeUserIsComponent} from "../system/make-user-is-component.js"

export const MetalIsPremium = makeUserIsComponent(isPremium)
