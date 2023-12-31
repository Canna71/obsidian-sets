import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import {sassPlugin} from 'esbuild-sass-plugin'
import svgrPlugin from 'esbuild-plugin-svgr';
import  {solidPlugin} from "esbuild-plugin-solid";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

const code = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.tsx'],
    // outdir: ".",
	bundle: true,
    minify: prod,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins],
	format: 'cjs',
	// watch: !prod,
	target: 'es2016',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
    plugins: [svgrPlugin(), solidPlugin()]
}).catch(() => process.exit(1));

const style = await esbuild.context({
	entryPoints: ['styles.scss'],
    outfile: "styles.css",
	// watch: !prod,
    plugins: [sassPlugin()]
}).catch(() => process.exit(1));

console.log("building code...")
await code.rebuild();
console.log("building styles...")

await style.rebuild();
console.log("building done.")

if(!prod) {
    console.log("watching code...")
    code.watch();
}
if(!prod) {
    console.log("watching styles...")
    style.watch();
}
// style.watch();
if(prod) {
    code.dispose();
    style.dispose();
}
