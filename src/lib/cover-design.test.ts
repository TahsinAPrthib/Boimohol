import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { coverDesign, FAMILY_BY_CATEGORY, graphemeEm, hashSeed, seededRandom, titleSize } from "./cover-design";

describe("generated cover design", () => {
  test("a book always gets the same cover", () => {
    const input = { seed: "kobita-sonar-tori", category: "kobita", colorKey: "oxblood", title: "সোনার তরী" };
    assert.deepEqual(coverDesign(input), coverDesign({ ...input }));
    assert.equal(hashSeed("kobita-sonar-tori"), hashSeed("kobita-sonar-tori"));
    const a = seededRandom(42);
    const b = seededRandom(42);
    assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  });

  test("each category has its own visual language; unknown ones and listings get the classic cover", () => {
    const families = new Set(Object.values(FAMILY_BY_CATEGORY));
    assert.equal(families.size, Object.keys(FAMILY_BY_CATEGORY).length, "no two categories share a family");
    assert.equal(coverDesign({ seed: "x", category: "poetry-unknown", title: "x" }).family, "classic");
    assert.equal(coverDesign({ seed: "x", category: null, title: "x" }).family, "classic");
    assert.equal(coverDesign({ seed: "x", category: "kobita", title: "x" }).family, "poetry");
  });

  test("neighbouring books in one category don't all look alike", () => {
    const shelf = Array.from({ length: 12 }, (_, i) => coverDesign({ seed: `uponnash-book-${i}`, category: "uponnash", colorKey: "cloth", title: "গোরা" }));
    const looks = new Set(shelf.map((d) => `${d.variant}/${d.layout}/${d.vars["--cv-bg"]}/${d.vars["--cv-orn"]}`));
    assert.ok(looks.size >= 6, `only ${looks.size} distinct looks`);
    assert.ok(new Set(shelf.map((d) => d.vars["--cv-bg"])).size >= 2, "one cloth tone for the whole shelf");
  });

  test("colours come from the palette; essays are paper lettered in ink", () => {
    const novel = coverDesign({ seed: "a", category: "uponnash", colorKey: "cloth", title: "গোরা" });
    assert.match(novel.vars["--cv-text"], /^#[0-9A-F]{6}$/i);
    const essay = coverDesign({ seed: "a", category: "probondho", colorKey: "ink", title: "গোরা" });
    assert.ok(essay.paper);
    assert.equal(essay.vars["--cv-text"], "#2A2420");
  });

  test("an essay's band and its title never share the foot of the cover", () => {
    for (let i = 0; i < 40; i++) {
      const d = coverDesign({ seed: `probondho-${i}`, category: "probondho", colorKey: "ink", title: "গোরা" });
      if (d.variant === 1) assert.notEqual(d.layout, "low");
      if (d.variant === 0) assert.equal(d.layout, "top");
    }
  });
});

describe("cover titles", () => {
  test("a vowel sign widens its letter: ো on both sides most of all", () => {
    assert.ok(graphemeEm("সো") > graphemeEm("সা"));
    assert.ok(graphemeEm("সা") > graphemeEm("স"));
    assert.ok(graphemeEm("সু") === graphemeEm("স"), "signs below take no width");
  });

  test("short titles are set large, long ones smaller", () => {
    assert.equal(titleSize("মা"), "xs");
    assert.equal(titleSize("গোরা"), "xs");
    assert.equal(titleSize("সোনার তরী", 0.5), "s");
    assert.ok(["l", "xl"].includes(titleSize("বাষ্পীয় রথারোহীদিগের প্রতি উপদেশ", 0.62)));
  });

  test("the longest word decides the size, so no word is split", () => {
    // "আলালের" is too wide for the narrow stage of a drama cover at "s".
    assert.equal(titleSize("আলালের ঘরের দুলাল", 0.54, 5), "m");
  });

  test("a title too long for every size gets the smallest, which shows the most of it", () => {
    const long = "পল্লীগ্রামস্থ চৌকীদার বিষয়ক প্রস্তাবিত রাজ নিয়মের বিরুদ্ধে ভারতবর্ষীয় সভার আবেদন";
    assert.equal(titleSize(long, 0.57, 4), "xl");
    assert.equal(titleSize("রথারোহীদিগেররথারোহীদিগের", 0.3), "xl", "a word too long for every size");
  });

  test("bold sans titles are never set larger than the same title in Tiro", () => {
    const order = ["xs", "s", "m", "l", "xl"];
    for (const t of ["গোরা", "আলালের ঘরের দুলাল", "The Adventures of Sherlock Holmes"]) {
      assert.ok(order.indexOf(titleSize(t, 0.72, 6, true)) >= order.indexOf(titleSize(t, 0.72, 6, false)), t);
    }
  });
});
