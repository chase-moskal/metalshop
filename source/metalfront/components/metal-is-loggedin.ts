
import {makeUserIsComponent} from "../system/make-user-is-component.js"

export const MetalIsLoggedin = makeUserIsComponent(user => !!user)
