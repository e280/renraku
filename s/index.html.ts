
import {ssg, html} from "@e280/scute"

export default ssg.page(import.meta.url, async orb => ({
	title: "renraku demo",
	js: "demo/main.bundle.min.js",
	css: "demo/main.css",
	dark: true,

	body: html`
		<h1>renraku v${orb.packageVersion()}</h1>
		<p>open the js console (F12?)</p>
	`,
}))

