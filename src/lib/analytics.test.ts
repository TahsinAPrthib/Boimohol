import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { forAnalytics } from "./analytics";

const SITE = "https://boimohol-delta.vercel.app";
const view = (path: string) => forAnalytics({ type: "pageview" as const, url: SITE + path });

describe("what analytics is told about a page view", () => {
  test("no query string: search terms, callbackUrl and sign-in errors stay on the device", () => {
    assert.equal(view("/search?q=%E0%A6%97%E0%A7%8B%E0%A6%B0%E0%A6%BE&lang=bn")?.url, `${SITE}/search`);
    assert.equal(view("/login?callbackUrl=%2Fprofile")?.url, `${SITE}/login`);
    assert.equal(view("/login?error=CredentialsSignin")?.url, `${SITE}/login`);
    assert.equal(view("/library?page=3")?.url, `${SITE}/library`);
  });

  test("no fragment either", () => {
    assert.equal(view("/books/probondho-the-prince/read/9#gb-fn-3.1")?.url, `${SITE}/books/probondho-the-prince/read/9`);
  });

  test("a path naming a person or a private conversation goes as its route", () => {
    assert.equal(view("/admin/users/cmvt3vxmh0000i6m2jemtk88j")?.url, `${SITE}/admin/users/[id]`);
    assert.equal(view("/messages/cmabc123?x=1")?.url, `${SITE}/messages/[conversationId]`);
    assert.equal(view("/admin/users")?.url, `${SITE}/admin/users`);
    assert.equal(view("/messages")?.url, `${SITE}/messages`);
  });

  test("everything else goes as it is, and the event keeps its type", () => {
    assert.deepEqual(view("/books/kobita-gitanjali"), { type: "pageview", url: `${SITE}/books/kobita-gitanjali` });
    assert.equal(view("/")?.url, `${SITE}/`);
  });

  test("an address that can't be read isn't sent", () => {
    assert.equal(forAnalytics({ type: "pageview", url: "not a url" }), null);
  });
});
