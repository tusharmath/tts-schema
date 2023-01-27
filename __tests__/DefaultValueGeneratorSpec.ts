import { describe, expect, test } from "@jest/globals"
import { Schema } from "../src/Schema"

describe("DefaultValueGenerator", () => {
  test("string", () => {
    const schema = Schema.macro.$derive!<string>()
    expect(schema.defaultValue).toBe("")
  })

  test("number", () => {
    const schema = Schema.macro.$derive!<number>()
    expect(schema.defaultValue).toBe(0)
  })

  test("boolean", () => {
    const schema = Schema.macro.$derive!<boolean>()
    expect(schema.defaultValue).toBe(false)
  })

  test("bigint", () => {
    const schema = Schema.macro.$derive!<bigint>()
    expect(schema.defaultValue).toBe(0n)
  })

  test("null", () => {
    const schema = Schema.macro.$derive!<null>()
    expect(schema.defaultValue).toBe(null)
  })

  test("undefined", () => {
    const schema = Schema.macro.$derive!<undefined>()
    expect(schema.defaultValue).toBe(undefined)
  })

  test("object", () => {
    const schema = Schema.macro.$derive!<{ a: string }>()
    expect(schema.defaultValue).toEqual({ a: "" })
  })

  test("nested object", () => {
    const schema = Schema.macro.$derive!<{ a: { b: string } }>()
    expect(schema.defaultValue).toEqual({ a: { b: "" } })
  })

  test("array", () => {
    const schema = Schema.macro.$derive!<string[]>()
    expect(schema.defaultValue).toEqual([])
  })

  test("nested array", () => {
    const schema = Schema.macro.$derive!<string[][]>()
    expect(schema.defaultValue).toEqual([])
  })

  test("union", () => {
    const schema = Schema.macro.$derive!<string | number>()
    expect(schema.defaultValue).toBe("")
  })

  test("intersection", () => {
    const schema = Schema.macro.$derive!<{ a: string } & { b: number }>()
    expect(schema.defaultValue).toStrictEqual({ a: "", b: 0 })
  })
})
