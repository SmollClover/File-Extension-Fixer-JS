import { rename as unsafeRename } from 'node:fs/promises';

export function getFileName(file: string): string {
    return file.split('/').pop() ?? '';
}

export function formatNumber(num: number) {
    return new Intl.NumberFormat('de-DE').format(num);
}

export async function rename(oldName: string, wantedName: string) {
    const originalName = wantedName;
    let newName = originalName;

    let i = 0;
    while (await Bun.file(newName).exists()) {
        const split = originalName.split('.');
        const extension = split[split.length - 1];
        const prefix = originalName.substring(0, originalName.length - extension.length - 1);

        newName = `${prefix} (${i}).${extension}`;
        i++;
    }

    await unsafeRename(oldName, newName);
    return newName;
}
