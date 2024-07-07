export function getFileName(file: string) {
	return file.split('/').pop();
}

export function formatNumber(num: number) {
	return new Intl.NumberFormat('de-DE').format(num);
}
