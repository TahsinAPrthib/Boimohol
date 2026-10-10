import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { breaksPublicDomainRule, canBePublicDomain, publicDomainCutoffYear } from "./public-domain";

const in2026 = new Date(Date.UTC(2026, 9, 10));

describe("public-domain rule (60 years after the end of the death year)", () => {
  test("in 2026 the cutoff is 1965", () => {
    assert.equal(publicDomainCutoffYear(in2026), 1965);
  });

  test("died 1965 or earlier: allowed; 1966 or later: not", () => {
    assert.equal(canBePublicDomain(1965, in2026), true);
    assert.equal(canBePublicDomain(1941, in2026), true); // Rabindranath Tagore
    assert.equal(canBePublicDomain(1966, in2026), false);
    assert.equal(canBePublicDomain(1976, in2026), false); // Kazi Nazrul Islam
    assert.equal(canBePublicDomain(1970, in2026), false); // Napoleon Hill
  });

  test("an unknown death year (or a living author) is never public domain", () => {
    assert.equal(canBePublicDomain(null, in2026), false);
    assert.equal(canBePublicDomain(undefined, in2026), false);
  });

  test("ancient authors (negative years = BCE) qualify", () => {
    assert.equal(canBePublicDomain(180, in2026), true);
    assert.equal(canBePublicDomain(-496, in2026), true);
  });

  test("the cutoff moves forward each new year, judged in UTC", () => {
    assert.equal(canBePublicDomain(1966, new Date(Date.UTC(2027, 0, 1, 0, 0))), true);
    assert.equal(canBePublicDomain(1966, new Date(Date.UTC(2026, 11, 31, 23, 59))), false);
  });

  test("breaksPublicDomainRule flags only a set flag without a qualifying year", () => {
    assert.equal(breaksPublicDomainRule({ isPublicDomain: true, authorDeathYear: 1976 }, in2026), true);
    assert.equal(breaksPublicDomainRule({ isPublicDomain: true, authorDeathYear: null }, in2026), true);
    assert.equal(breaksPublicDomainRule({ isPublicDomain: true, authorDeathYear: 1950 }, in2026), false);
    assert.equal(breaksPublicDomainRule({ isPublicDomain: false, authorDeathYear: null }, in2026), false);
  });
});
