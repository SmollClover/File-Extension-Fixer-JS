import { rename as unsafeRename } from 'node:fs/promises';

export function getFileName(file: string): string {
    return file.split('/').pop() ?? '';
}

export function formatNumber(num: number) {
    return new Intl.NumberFormat('de-DE').format(num);
}

export async function rename(oldPath: string, wantedPath: string) {
    const originalPath = wantedPath;
    let newPath = originalPath;

    let i = 0;
    while (await Bun.file(newPath).exists()) {
        const split = originalPath.split('.');
        const extension = split[split.length - 1];
        const prefix = originalPath.substring(0, originalPath.length - extension.length - 1);

        newPath = `${prefix} (${i}).${extension}`;
        i++;
    }

    return unsafeRename(oldPath, newPath);
}
