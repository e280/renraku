
import {Fn, Fns} from "./types.js"

export const tune = Symbol("tune")
export const query = Symbol("query")
export const notify = Symbol("notify")
export const settings = Symbol("settings")

export type TuneSymbol = typeof tune
export type QuerySymbol = typeof query
export type NotifySymbol = typeof notify
export type SettingsSymbol = typeof settings

declare global {
	interface RenrakuSettings {}
}

export type Executor = (
	path: string[],
	args: any[],
	settings: Settings,
) => Promise<any>

export type Settings = {
	notify?: boolean
} & Partial<RenrakuSettings>

export type Remote<F extends Fn | Fns> = (
	F extends Fn
		? F & {
			[tune]: (settings: Settings) => F
			[query]: F
			[notify]: F
			[settings]: Settings
		}
		: F extends Fns
			? {[K in keyof F]: Remote<F[K]>}
			: never
)

export function remoteProxy<F extends Fns>(executor: Executor) {

	function recurse(path: string[]) {
		const currentSettings: Settings = {notify: undefined}

		return new Proxy((() => {}) as any, {
			apply: (_, _this, args) => {
				return executor(path, args, currentSettings)
			},
			get: (target, key: string | QuerySymbol | NotifySymbol | TuneSymbol | SettingsSymbol) => {

				if (key === "then")
					return undefined

				if (key === tune)
					return (settings: Settings) => (...args: any[]) => executor(path, args, {
						...currentSettings,
						...settings,
					})

				if (key === notify)
					return (...args: any[]) => executor(path, args, {
						...currentSettings,
						notify: true,
					})

				if (key === query)
					return (...args: any[]) => executor(path, args, {
						...currentSettings,
						notify: false,
					})

				if (key === settings)
					return currentSettings

				if (!target[key])
					target[key] = recurse([...path, key])

				return target[key]
			},
			set: (target, key: string, value: any) => {
				target[key] = value
				return true
			},
		})
	}

	return recurse([]) as Remote<F>
}

