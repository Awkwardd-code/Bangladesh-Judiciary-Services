import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { materialsCol } from "@/lib/collections";
import { deleteFile } from "@/lib/cloudinary";
import { withGuard } from "@/lib/route-guard";
import { materialUpdateSchema } from "@/lib/validators/material";

export const GET = withGuard(
  { kind: "admin" },
  async (_request, { params }) => {
    try {
      const { id, materialId } = params;
      if (!ObjectId.isValid(id) || !ObjectId.isValid(materialId)) {
        return fail("Material not found.", 404);
      }

      const material = await (await materialsCol()).findOne({
        _id: new ObjectId(materialId),
        courseId: new ObjectId(id),
      });
      if (!material) return fail("Material not found.", 404);

      return ok({ material });
    } catch (error) {
      console.error("Get course material error", error);
      return fail("Server error", 500);
    }
  },
);

export const PATCH = withGuard(
  { kind: "admin" },
  async (request, { params }) => {
    try {
      const { id, materialId } = params;
      if (!ObjectId.isValid(id) || !ObjectId.isValid(materialId)) {
        return fail("Material not found.", 404);
      }

      const parsed = materialUpdateSchema.safeParse(await request.json());
      if (!parsed.success) {
        return fail(parsed.error.issues[0]?.message ?? "Invalid material.", 400);
      }

      const collection = await materialsCol();
      const filter = {
        _id: new ObjectId(materialId),
        courseId: new ObjectId(id),
      };
      const existing = await collection.findOne(filter);
      if (!existing) return fail("Material not found.", 404);

      const update = { ...parsed.data, updatedAt: new Date() };
      await collection.updateOne(filter, { $set: update });
      const material = await collection.findOne(filter);

      if (
        existing.publicId &&
        parsed.data.publicId !== undefined &&
        parsed.data.publicId !== existing.publicId
      ) {
        void deleteFile(existing.publicId).catch((error) => {
          console.error("Delete replaced course material file failed", error);
        });
      }

      return ok({ material });
    } catch (error) {
      console.error("Update course material error", error);
      return fail("Server error", 500);
    }
  },
);

export const DELETE = withGuard(
  { kind: "admin" },
  async (_request, { params }) => {
    try {
      const { id, materialId } = params;
      if (!ObjectId.isValid(id) || !ObjectId.isValid(materialId)) {
        return fail("Material not found.", 404);
      }

      const collection = await materialsCol();
      const filter = {
        _id: new ObjectId(materialId),
        courseId: new ObjectId(id),
      };
      const material = await collection.findOne(filter);
      if (!material) return fail("Material not found.", 404);

      if (material.publicId) {
        try {
          await deleteFile(material.publicId);
        } catch (error) {
          console.error("Delete course material file failed", error);
        }
      }

      await collection.deleteOne(filter);
      return ok({ message: "Material deleted." });
    } catch (error) {
      console.error("Delete course material error", error);
      return fail("Server error", 500);
    }
  },
);
