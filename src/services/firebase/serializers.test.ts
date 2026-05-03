import { removeUndefinedFields } from "./serializers";

describe("removeUndefinedFields", () => {
  it("removes undefined values before Firestore writes", () => {
    expect(
      removeUndefinedFields({
        content: "Plan",
        dueDate: undefined,
        nested: {
          completedAt: undefined,
          status: "todo",
        },
        checklist: ["One", undefined, "Two"],
      }),
    ).toEqual({
      content: "Plan",
      nested: {
        status: "todo",
      },
      checklist: ["One", "Two"],
    });
  });
});
