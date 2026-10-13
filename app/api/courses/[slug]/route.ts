import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireSession } from "@/lib/auth-guard";
import { coursesCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";
import type { Course } from "@/lib/types/course";

function serializeCourse(course: Course) {
  const { _id, segments, ...rest } = course;
  const sanitizedSegments = Array.isArray(segments)
    ? segments.map((segment) => ({
        ...segment,
        subSegments: (segment.subSegments ?? []).map((subSegment) => {
          const payload = { ...subSegment.payload };
          delete payload.pdfUrl;
          delete payload.pdfPublicId;
          return { ...subSegment, payload };
        }),
      }))
    : segments;

  return {
    id: (_id as ObjectId).toString(),
    ...rest,
    ...(segments ? { segments: sanitizedSegments } : {}),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await requireSession();

  if (!session) {
    return fail("Unauthorized", 401);
  }

  try {
    const { slug } = await params;
    const collection = await coursesCol();
    const course = await collection.findOne({ slug });

    if (!course) {
      return fail("Course not found", 404);
    }

    const access = await getEnrollmentAccess(
      new ObjectId(session.userId),
      course._id,
    );

    if (
      (course.price > 0 || course.programKind === "exam") &&
      !access.hasAccess
    ) {
      return ok({
        course: serializeCourse(course),
        access: {
          hasAccess: access.hasAccess,
          reason: access.reason,
        },
        materials: [],
      });
    }

    const materials = Array.isArray((course as any).materials)
      ? (course as any).materials
      : [];

    return ok({
      course: serializeCourse(course),
      access: {
        hasAccess: access.hasAccess,
        reason: access.reason,
      },
      materials,
    });
  } catch (error) {
    console.error("Get course detail error", error);
    return fail("Server error", 500);
  }
}
