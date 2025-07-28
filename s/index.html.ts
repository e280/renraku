
import {ssg, html} from "@e280/scute"

export default ssg.page(import.meta.url, async orb => ({
	title: "renraku demo",
	js: "demo/main.bundle.min.js",
	css: "demo/main.css",
	dark: true,
	body: html`
		<h1>renraku</h1>
		<p>v${orb.packageVersion()}</p>
		<p>see test results in js console</p>
	`,
}))

