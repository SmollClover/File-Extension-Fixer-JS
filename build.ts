console.log(
	(
		await Bun.build({
			entrypoints: ['src/index.ts'],
			outdir: './out',
			minify: true,
			splitting: false,
			target: 'bun',
			sourcemap: 'none',
			naming: 'fixFileExt.js',
		})
	).logs.join('\n'),
);
