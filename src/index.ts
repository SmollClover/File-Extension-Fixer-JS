#!/usr/bin/env bun

import { readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { MultiBar, Presets } from 'cli-progress';
import { fileTypeFromBuffer } from 'file-type';

function getFileName(file: string) {
	return file.split('/').pop();
}

function formatNumber(num: number) {
	return new Intl.NumberFormat('de-DE').format(num);
}

const multibar = new MultiBar(
	{
		clearOnComplete: false,
		format: '{bar} {percentage}% | {value}/{total}',
	},
	Presets.shades_grey,
);

let directory = '.';
if (process.argv.length > 2) directory = process.argv[2];

const files = (await readdir(directory, { withFileTypes: true }))
	.filter((entry) => entry.isFile())
	.map((file) => join(directory, file.name))
	.filter((file) => !file.split('/').pop()?.startsWith('.'));

const cacheFile = Bun.file(join(directory, '.fixFileExt.cache'));
let oldCache: string[] = [];
const newCache: string[] = [];

if (await cacheFile.exists()) {
	try {
		oldCache = await cacheFile.json();
	} catch (e) {
		console.error(e);
	}
}

console.log(`Reading directory ${directory} : ${formatNumber(files.length)} files\n`);

const progress = multibar.create(files.length, 0);

let changed = 0;
let failed = 0;
let skipped = 0;
let cached = 0;

for (const file of files) {
	if (oldCache.includes(file)) {
		newCache.push(file);
		cached++;

		progress.increment();
		continue;
	}

	const buffer = await Bun.file(file).arrayBuffer();
	const fileType = await fileTypeFromBuffer(buffer);

	if (!fileType) {
		multibar.log(`${'?'.repeat(12)} │ ${getFileName(file)} -> Unable to detect\n`);
		multibar.update();
		failed++;

		progress.increment();
		continue;
	}

	if (!fileType.mime.startsWith('image') && !fileType.mime.startsWith('video')) {
		newCache.push(file);
		skipped++;

		progress.increment();
		continue;
	}

	if (!file.includes('.')) {
		const newFile = `${file}.${fileType.ext}`;

		multibar.log(`${fileType.mime.padEnd(12)} │ ${getFileName(file)} -> ${getFileName(newFile)}\n`);
		multibar.update();
		rename(file, newFile);

		newCache.push(newFile);
		changed++;

		progress.increment();
		continue;
	}

	const currentExtension = file.split('.').pop();
	if (currentExtension === fileType.ext) {
		newCache.push(file);

		progress.increment();
		continue;
	}

	const splitFile = file.split('.');
	splitFile.pop();
	splitFile.push(fileType.ext);
	const newFile = splitFile.join('.');

	multibar.log(`${fileType.mime.padEnd(12)} │ ${getFileName(file)} -> ${getFileName(newFile)}\n`);
	multibar.update();
	rename(file, newFile);

	newCache.push(newFile);
	changed++;

	progress.increment();
}

multibar.stop();

Bun.write(cacheFile, JSON.stringify(newCache));

console.log(
	`\nChanged : ${formatNumber(changed)}\nSkipped : ${formatNumber(skipped)}\nCached  : ${formatNumber(
		cached,
	)}\nFailed  : ${formatNumber(failed)}`,
);
