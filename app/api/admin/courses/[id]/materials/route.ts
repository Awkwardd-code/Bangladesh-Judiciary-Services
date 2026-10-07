import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol, materialsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { withGuard } from "@/lib/route-guard";
import { materialCreateSchema } from "@/lib/validators/material";

export const GET = withGuard(
  { kind: "admin" },
  async (_request, { params }) => {
    try {
      const { id } = params;
      if (!ObjectId.isValid(id)) return fail("Course not found.", 404);

      await ensureIndexes();
      const courseId = new ObjectId(id);
      const course = await (await coursesCol()).findOne({ _id: courseId });
      if (!course) return fail("Course not found.", 404);

      const materials = await (await materialsCol())
        .find({ courseId })
        .sort({ order: 1, createdAt: 1 })
        .toArray();

      return ok({ materials });
    } catch (error) {
      console.error("List course materials error", error);
      return fail("Server error", 500);
    }
  },
);

export const POST = withGuard(
  { kind: "admin" },
  async (request, { params, session }) => {
    try {
      const { id } = params;
      if (!ObjectId.isValid(id)) return fail("Course not found.", 404);

      const parsed = materialCreateSchema.safeParse(await request.json());
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid material.", 400);
      }
      if (!new ObjectId(parsed.data.courseId).equals(new ObjectId(id))) {
        return fail("Material course does not match the route.", 400);
      }

      const courseId = new ObjectId(id);
      const course = await (await coursesCol()).findOne({ _id: courseId });
      if (!course) return fail("Course not found.", 404);

      const now = new Date();
      const material = {
        _id: new ObjectId(),
        ...parsed.data,
        courseId,
        createdBy: new ObjectId(session!.userId),
        createdAt: now,
        updatedAt: now,
      };

      await (await materialsCol()).insertOne(material);
      return ok({ material }, 201);
    } catch (error) {
      console.error("Create course material error", error);
      return fail("Server error", 500);
    }
  },
);
