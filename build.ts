console.log(
    (
        await Bun.build({
            entrypoints: ['src/index.ts'],
            outdir: './out',
            minify: true,
            target: 'bun',
            sourcemap: 'inline',
            naming: 'fixFileExt.js',
        })
    ).logs.join('\n'),
);
