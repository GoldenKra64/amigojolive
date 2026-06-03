const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { canUserModifyPostTags } = require("../src/mcp/posts-tool-auth");

describe("canUserModifyPostTags", () => {
  it("rechaza sin userId", () => {
    const result = canUserModifyPostTags({ id: 1, authorId: 1, deletedAt: null }, {});
    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 401);
  });

  it("rechaza publicación inexistente", () => {
    const result = canUserModifyPostTags(null, { userId: 1, role: "docente" });
    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 404);
  });

  it("rechaza docente que no es autor", () => {
    const result = canUserModifyPostTags(
      { id: 1, authorId: 99, deletedAt: null },
      { userId: 2, role: "docente" }
    );
    assert.equal(result.allowed, false);
    assert.equal(result.statusCode, 403);
  });

  it("permite al autor", () => {
    const result = canUserModifyPostTags(
      { id: 1, authorId: 2, deletedAt: null },
      { userId: 2, role: "docente" }
    );
    assert.equal(result.allowed, true);
  });

  it("permite admin aunque no sea autor", () => {
    const result = canUserModifyPostTags(
      { id: 1, authorId: 99, deletedAt: null },
      { userId: 1, role: "admin" }
    );
    assert.equal(result.allowed, true);
  });
});
