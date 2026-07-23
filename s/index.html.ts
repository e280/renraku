
import {template, html, dataSvgEmoji} from "@e280/scute"

export default template(import.meta.url, async orb => html`
	<!doctype html>
	<html>
		<head>
			<meta charset="utf-8"/>
			<meta name="viewport" content="width=device-width,initial-scale=1"/>
			<meta name="darkreader-lock"/>
			<style>@layer base{html{background:#000}}</style>

			<title>renraku demo</title>
			<link rel="icon" href="${dataSvgEmoji("⛩️")}"/>
			<link rel="stylesheet" href="${orb.hashurl("demo/main.css")}"/>
			<script type="module" src="${orb.hashurl("demo/main.bundle.min.js")}"></script>
		</head>
		<body>
			<h1>renraku</h1>
			<p>v${orb.packageVersion()}</p>
			<p>see test results in js console</p>
		</body>
	</html>
`)

