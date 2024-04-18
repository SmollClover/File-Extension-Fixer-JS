#!/usr/bin/env bun

import { readdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { fileTypeFromBuffer } from 'file-type';

function getFileName(file: string) {
	return file.split('/').pop();
}

function formatNumber(num: number) {
	return new Intl.NumberFormat('de-DE').format(num);
}

let directory = '.';
if (process.argv.length > 2) directory = process.argv[2];

const files = (await readdir(directory, { withFileTypes: true }))
	.filter((entry) => entry.isFile())
	.map((file) => join(directory, file.name))
	.filter((file) => !file.split('/').pop()?.startsWith('.'));

console.log(`Reading directory ${directory} : ${formatNumber(files.length)} files\n`);

let changed = 0;
let failed = 0;

for (const file of files) {
	const buffer = await Bun.file(file).arrayBuffer();
	const fileType = await fileTypeFromBuffer(buffer);

	if (!fileType) {
		console.log(`${'?'.repeat(12)} │ ${getFileName(file)} -> Unable to detect`);
		failed++;

		continue;
	}

	if (!fileType.mime.startsWith('image') && !fileType.mime.startsWith('video')) continue;

	if (!file.includes('.')) {
		const newFile = `${file}.${fileType.ext}`;

		console.log(`${fileType.mime.padEnd(12)} │ ${getFileName(file)} -> ${getFileName(newFile)}`);
		rename(file, newFile);
		changed++;

		continue;
	}

	const currentExtension = file.split('.').pop();
	if (currentExtension === fileType.ext) continue;

	const splitFile = file.split('.');
	splitFile.pop();
	splitFile.push(fileType.ext);
	const newFile = splitFile.join('.');

	console.log(`${fileType.mime.padEnd(12)} │ ${getFileName(file)} -> ${getFileName(newFile)}`);
	rename(file, newFile);
	changed++;
}

console.log(`\nChanged: ${formatNumber(changed)}\nFailed: ${formatNumber(failed)}`);
