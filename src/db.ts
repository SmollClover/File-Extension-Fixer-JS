import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import { getFileName } from './functions';

export class DB implements Disposable {
	private db;

	[Symbol.dispose]() {
		this.db.close();
	}

	constructor(directory: string) {
		this.db = new Database(join(directory, '.fixFileExt.sqlite'), { create: true, strict: true });

		this.db.query('CREATE TABLE IF NOT EXISTS cache (file VARCHAR(255) NOT NULL)').run();
		this.db.query('CREATE INDEX IF NOT EXISTS idx_file ON cache(file)').run();
	}

	public includes(file: string) {
		const query = this.db.query('SELECT * FROM cache WHERE file = ?1');
		const results = query.all(getFileName(file));

		return results.length > 0;
	}

	public add(file: string) {
		if (this.includes(file)) return;

		const query = this.db.query('INSERT INTO cache (file) VALUES (?1)');
		query.run(getFileName(file));
	}
}
