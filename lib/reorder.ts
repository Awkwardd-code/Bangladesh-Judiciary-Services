import { ObjectId } from "mongodb";

import { getDb } from "@/lib/db";

export async function swapOrder(
  collectionName: "preliminary_questions" | "written_questions",
  examId: ObjectId,
  questionId: ObjectId,
  direction: "up" | "down",
): Promise<void> {
  const collection = (await getDb()).collection(collectionName);
  const current = await collection.findOne({ _id: questionId, examId });

  if (!current) {
    return;
  }

  const filter =
    direction === "up"
      ? { examId, order: { $lt: current.order } }
      : { examId, order: { $gt: current.order } };

  const sort: Record<string, 1 | -1> =
    direction === "up" ? { order: -1 } : { order: 1 };
  const adjacent = await collection.findOne(filter, { sort });

  if (!adjacent) {
    return;
  }

  const updatedAt = new Date();

  await collection.updateOne(
    { _id: questionId },
    { $set: { order: adjacent.order, updatedAt } },
  );

  await collection.updateOne(
    { _id: adjacent._id },
    { $set: { order: current.order, updatedAt } },
  );
}
