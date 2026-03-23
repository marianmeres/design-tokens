/**
 * Parse a hex color string to RGB components.
 * Supports "#abc" (3-digit) and "#aabbcc" (6-digit) formats.
 * Returns null if the input is not a valid hex color.
 */
export function hexToRgb(hex: string): [number, number, number] | null {
	hex = hex.replace(/^#/, "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	if (hex.length !== 6) return null;
	const n = parseInt(hex, 16);
	if (isNaN(n)) return null;
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Convert a hex color to an "r, g, b" triplet string.
 * Returns null if the input is not a valid hex color.
 */
export function hexToRgbTriplet(hex: string): string | null {
	const rgb = hexToRgb(hex);
	return rgb ? rgb.join(", ") : null;
}
