import { type } from 'node:os';
import type { Build } from 'bun';

let target: Build.CompileTarget;
switch (type()) {
    case 'Linux':
        target = 'bun-linux-x64-modern';
        break;
    case 'Darwin':
        target = 'bun-darwin-x64-modern';
        break;
    case 'Windows_NT':
        target = 'bun-windows-x64-modern';
        break;
    default:
        throw Error('Build target could not be determined');
}

console.log(
    (
        await Bun.build({
            entrypoints: ['src/index.ts'],
            outdir: './out',
            target: 'bun',
            minify: true,
            sourcemap: 'inline',
            compile: {
                target,
                outfile: 'fixFileExt',
            },
        })
    ).logs.join('\n'),
);
