import { assertEquals } from "@std/assert";
import { hexToRgb, hexToRgbTriplet } from "../src/utils.ts";

Deno.test("hexToRgb - 6-digit hex with #", () => {
	assertEquals(hexToRgb("#0d6efd"), [13, 110, 253]);
});

Deno.test("hexToRgb - 6-digit hex without #", () => {
	assertEquals(hexToRgb("0d6efd"), [13, 110, 253]);
});

Deno.test("hexToRgb - 3-digit hex", () => {
	assertEquals(hexToRgb("#abc"), [170, 187, 204]);
});

Deno.test("hexToRgb - 3-digit hex without #", () => {
	assertEquals(hexToRgb("abc"), [170, 187, 204]);
});

Deno.test("hexToRgb - black", () => {
	assertEquals(hexToRgb("#000000"), [0, 0, 0]);
});

Deno.test("hexToRgb - white", () => {
	assertEquals(hexToRgb("#ffffff"), [255, 255, 255]);
});

Deno.test("hexToRgb - invalid input returns null", () => {
	assertEquals(hexToRgb("not-a-color"), null);
	assertEquals(hexToRgb("#gg0000"), null);
	assertEquals(hexToRgb(""), null);
	assertEquals(hexToRgb("#12345"), null);
});

Deno.test("hexToRgbTriplet - valid hex", () => {
	assertEquals(hexToRgbTriplet("#0d6efd"), "13, 110, 253");
});

Deno.test("hexToRgbTriplet - 3-digit hex", () => {
	assertEquals(hexToRgbTriplet("#abc"), "170, 187, 204");
});

Deno.test("hexToRgbTriplet - invalid returns null", () => {
	assertEquals(hexToRgbTriplet("not-a-color"), null);
});
