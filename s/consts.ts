
import {seconds} from "@e280/stz"

export const defaultLocalTimeout = seconds(10)
export const defaultRemoteTimeout = seconds(60)
export const heartbeatInterval = seconds(10)
export const maxSocketBacklog = 1024
export const defaultMaxRequestSize = 10_000_000
export const unexposedErrorMessage = "an error occurred (details not exposed, renraku security precaution)"

