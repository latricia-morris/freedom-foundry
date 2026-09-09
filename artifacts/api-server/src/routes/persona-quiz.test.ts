import { describe, expect, it } from "vitest";
import { ARCHETYPE_PRIORITY, questions, scoreQuizAnswers } from "@workspace/db";

describe("brand persona quiz definition and scoring", () => {
  it("preserves the canonical 18 questions and six choices", () => {
    expect(questions).toHaveLength(18);
    expect(questions.every((question) => question.answers.length === 6)).toBe(true);
  });

  it("uses the Q1-Q7 subtotal before fixed priority for deterministic ties", () => {
    const result = scoreQuizAnswers([4, 2, 4, 0, 4, 0, 2, 0, 2, 4, 2, 0, 2, 4, 4, 4, 2, 2]);

    expect(result.scores.Magician).toBe(10);
    expect(result.scores.Creator).toBe(10);
    expect(result.scores.Everyman).toBe(10);
    expect(result.coreScores.Magician).toBe(6);
    expect(result.coreScores.Creator).toBe(6);
    expect(result.coreScores.Everyman).toBe(3);
    expect(ARCHETYPE_PRIORITY.indexOf("Everyman")).toBeLessThan(
      ARCHETYPE_PRIORITY.indexOf("Jester"),
    );
    expect(result.primary).toBe("Magician");
    expect(result.secondary).toBe("Creator");
  });

  it("rejects incomplete and out-of-range answer sets", () => {
    expect(() => scoreQuizAnswers(Array(17).fill(0))).toThrow("Expected 18 answers");
    expect(() => scoreQuizAnswers([...Array(17).fill(0), 6])).toThrow(
      "Invalid answer for question 18",
    );
  });
});