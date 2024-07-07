import { MultiBar, Presets } from 'cli-progress';
import type { FileTypeResult } from 'file-type';
import { getFileName } from './functions';

export class Bar {
	private multibar;
	private progress;

	constructor(total: number) {
		this.multibar = new MultiBar(
			{
				clearOnComplete: false,
				format: '{bar} {percentage}% | {value}/{total}',
			},
			Presets.shades_grey,
		);

		this.progress = this.multibar.create(total, 0);
	}

	public stop() {
		this.multibar.stop();
	}

	public skip() {
		this.progress.increment();
	}

	public unableToDetect(file: string) {
		this.multibar.log(`${'?'.repeat(12)} │ ${getFileName(file)} -> Unable to detect\n`);
		this.multibar.update();

		this.progress.increment();
	}

	public changedFileExt(fileType: FileTypeResult, oldFile: string, newFile: string) {
		this.multibar.log(`${fileType.mime.padEnd(12)} │ ${getFileName(oldFile)} -> ${getFileName(newFile)}\n`);
		this.multibar.update();
		this.progress.increment();
	}
}
