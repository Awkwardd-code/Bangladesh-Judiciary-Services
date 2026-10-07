import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol, materialsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { getEnrollmentAccess } from "@/lib/enrollment";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
    try {
      const { slug } = params;
      await ensureIndexes();

      const course = await (await coursesCol()).findOne({
        slug,
        status: "published",
        isPublished: true,
      });
      if (!course) return fail("Course not found.", 404);

      const access = await getEnrollmentAccess(
        new ObjectId(session!.userId),
        course._id,
      );
      const allMaterials = await (await materialsCol())
        .find({ courseId: course._id })
        .sort({ order: 1, createdAt: 1 })
        .toArray();
      const visibleMaterials =
        access.hasAccess || course.price === 0
          ? allMaterials
          : allMaterials.filter((material) => material.isFreePreview);
      const materials = visibleMaterials.map((material) => {
        const safeMaterial = { ...material };
        delete safeMaterial.publicId;
        return safeMaterial;
      });

      return ok({ materials, hasAccess: access.hasAccess || course.price === 0 });
    } catch (error) {
      console.error("List student course materials error", error);
      return fail("Server error", 500);
    }
  },
);
