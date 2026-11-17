import assert from "node:assert/strict";
import { test } from "node:test";
import { hexToRgb, hexToRgbTriplet } from "../src/utils.ts";

test("hexToRgb - 6-digit hex with #", () => {
	assert.deepStrictEqual(hexToRgb("#0d6efd"), [13, 110, 253]);
});

test("hexToRgb - 6-digit hex without #", () => {
	assert.deepStrictEqual(hexToRgb("0d6efd"), [13, 110, 253]);
});

test("hexToRgb - 3-digit hex", () => {
	assert.deepStrictEqual(hexToRgb("#abc"), [170, 187, 204]);
});

test("hexToRgb - 3-digit hex without #", () => {
	assert.deepStrictEqual(hexToRgb("abc"), [170, 187, 204]);
});

test("hexToRgb - black", () => {
	assert.deepStrictEqual(hexToRgb("#000000"), [0, 0, 0]);
});

test("hexToRgb - white", () => {
	assert.deepStrictEqual(hexToRgb("#ffffff"), [255, 255, 255]);
});

test("hexToRgb - invalid input returns null", () => {
	assert.deepStrictEqual(hexToRgb("not-a-color"), null);
	assert.deepStrictEqual(hexToRgb("#gg0000"), null);
	assert.deepStrictEqual(hexToRgb(""), null);
	assert.deepStrictEqual(hexToRgb("#12345"), null);
});

test("hexToRgbTriplet - valid hex", () => {
	assert.deepStrictEqual(hexToRgbTriplet("#0d6efd"), "13, 110, 253");
});

test("hexToRgbTriplet - 3-digit hex", () => {
	assert.deepStrictEqual(hexToRgbTriplet("#abc"), "170, 187, 204");
});

test("hexToRgbTriplet - invalid returns null", () => {
	assert.deepStrictEqual(hexToRgbTriplet("not-a-color"), null);
});
