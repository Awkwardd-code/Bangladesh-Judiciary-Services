import { ObjectId } from "mongodb";
import { z } from "zod";

import { fail, ok } from "@/lib/api-response";
import { freeTestsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";

const migrationSchema = z.object({
  freeTestIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
});

export const POST = withGuard({ kind: "admin" }, async (request) => {
  try {
    const requestBody = await request.text();
    let body: unknown = {};

    if (requestBody.trim()) {
      try {
        body = JSON.parse(requestBody);
      } catch {
        return fail("Request body must be valid JSON.", 400);
      }
    }

    const parsed = migrationSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    await ensureIndexes();

    const query = {
      questionsPerAttempt: 1,
      totalQuestions: { $gt: 1 },
      ...(parsed.data.freeTestIds
        ? {
            _id: {
              $in: parsed.data.freeTestIds.map(
                (freeTestId) => new ObjectId(freeTestId)
              ),
            },
          }
        : {}),
    };
    const collection = await freeTestsCol();
    const tests = await collection
      .find(query, { projection: { _id: 1, title: 1 } })
      .toArray();
    const fixed: Array<{
      id: string;
      title: string;
      previous: 1;
      next: 0;
    }> = [];

    for (const test of tests) {
      const updatedAt = new Date();
      const result = await collection.updateOne(
        {
          _id: test._id,
          questionsPerAttempt: 1,
          totalQuestions: { $gt: 1 },
        },
        {
          $set: {
            questionsPerAttempt: 0,
            updatedAt,
          },
        }
      );

      if (result.modifiedCount === 1) {
        fixed.push({
          id: test._id.toString(),
          title: test.title,
          previous: 1,
          next: 0,
        });
      }
    }

    return ok({
      fixed,
      count: fixed.length,
    });
  } catch (error) {
    console.error("Fix free test question counts error", error);
    return fail("Server error", 500);
  }
});
