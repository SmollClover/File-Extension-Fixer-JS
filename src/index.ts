#!/usr/bin/env bun

import { readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import { Bar } from './bar';
import { DB } from './db';
import { formatNumber } from './functions';

let directory = '.';
if (process.argv.length > 2) directory = process.argv[2];

const files = (await readdir(directory, { withFileTypes: true }))
	.filter((entry) => entry.isFile())
	.map((file) => join(directory, file.name))
	.filter((file) => !file.split('/').pop()?.startsWith('.'));

console.log(`Reading directory ${directory} : ${formatNumber(files.length)} files\n`);

using db = new DB(directory);
const bar = new Bar(files.length);

let changed = 0;
let failed = 0;
let skipped = 0;
let cached = 0;

for (const file of files) {
	if (db.includes(file)) {
		cached++;

		bar.skip();
		continue;
	}

	const buffer = await Bun.file(file).arrayBuffer();
	const fileType = await fileTypeFromBuffer(buffer);

	if (!fileType) {
		failed++;

		bar.unableToDetect(file);
		continue;
	}

	if (!fileType.mime.startsWith('image') && !fileType.mime.startsWith('video')) {
		db.add(file);
		skipped++;

		bar.skip();
		continue;
	}

	if (!file.includes('.')) {
		const newFile = `${file}.${fileType.ext}`;
		rename(file, newFile);

		db.add(newFile);
		changed++;

		bar.changedFileExt(fileType, file, newFile);
		continue;
	}

	const currentExtension = file.split('.').pop();
	if (currentExtension === fileType.ext) {
		db.add(file);

		bar.skip();
		continue;
	}

	const splitFile = file.split('.');
	splitFile.pop();
	splitFile.push(fileType.ext);

	const newFile = splitFile.join('.');
	rename(file, newFile);

	db.add(newFile);
	changed++;

	bar.changedFileExt(fileType, file, newFile);
}

bar.stop();

console.log(
	`\nChanged : ${formatNumber(changed)}\nSkipped : ${formatNumber(skipped)}\nCached  : ${formatNumber(
		cached,
	)}\nFailed  : ${formatNumber(failed)}`,
);
