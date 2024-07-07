# File Extension Fixer

A tool that looks over every photo and video in a directory and corrects the file extension based off of the magic number of the file.

---

## Cache

File Extension Fixer produces a cache file called `.fixFileExt.sqlite` in the directory that got passed as the argument to speed up execution for large directories if run again in the future. The cache file is a simple SQLite database containing a single column named `file` which can hold a VARCHAR of length 255 and includes a INDEX called `idx_file` for the `file` column to speed up searching for the file when checking the cache.

---

## Usage

### Building

```bash
bun i
bun run build
```

### Executing Project

This only applies when wanting to run the project on the source directly without building it first.

```bash
bun i
bun run . <directory>
```

### Executing Standalone

This only applies when wanting to run the standalone script produced in the out directory once built.

```bash
./fixFileExt.js <directory>
```
