import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";
import { aboutsCol } from "@/lib/collections";
import { ensureIndexes } from "@/lib/indexes";
import { defaultAboutSeed } from "@/lib/seed/about-default";
import type { About } from "@/lib/types/about";
import type { AboutShape } from "@/lib/types/about";
import { aboutUpdateSchema } from "@/lib/validators/about";

function serializeAbout(about: About): AboutShape {
  return {
    heroKicker: about.heroKicker,
    heroTitle: about.heroTitle,
    heroSubtitle: about.heroSubtitle,
    missionKicker: about.missionKicker,
    missionTitle: about.missionTitle,
    missionParagraphs: about.missionParagraphs,
    approachKicker: about.approachKicker,
    approachTitle: about.approachTitle,
    approachPillars: about.approachPillars,
    whyKicker: about.whyKicker,
    whyTitle: about.whyTitle,
    whyComparisonRows: about.whyComparisonRows,
    facultyKicker: about.facultyKicker,
    facultyTitle: about.facultyTitle,
    stats: about.stats,
  };
}

export async function GET() {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    await ensureIndexes();

    const about = await (await aboutsCol()).findOne({});

    if (!about) {
      return ok({
        about: null,
        defaults: defaultAboutSeed,
      });
    }

    return ok({ about: serializeAbout(about) });
  } catch (error) {
    console.error("Get about error", error);
    return fail("Server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return fail("Forbidden", 403);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return fail("Invalid request", 400);
    }

    const parsed = aboutUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Invalid about payload",
        400
      );
    }

    await ensureIndexes();

    const collection = await aboutsCol();
    const now = new Date();
    const fields = {
      ...parsed.data,
      singleton: true as const,
      updatedBy: new ObjectId(session.userId),
      updatedAt: now,
    };
    const existing = await collection.findOne({});

    if (existing) {
      await collection.updateOne({ _id: existing._id }, { $set: fields });
    } else {
      try {
        await collection.insertOne({
          _id: new ObjectId(),
          ...fields,
          createdAt: now,
        });
      } catch (insertError) {
        if (
          !insertError ||
          typeof insertError !== "object" ||
          !("code" in insertError) ||
          insertError.code !== 11000
        ) {
          throw insertError;
        }

        const concurrentAbout = await collection.findOne({ singleton: true });

        if (!concurrentAbout) {
          throw insertError;
        }

        await collection.updateOne(
          { _id: concurrentAbout._id },
          { $set: fields }
        );
      }
    }

    const updated = await collection.findOne({ singleton: true });

    if (!updated) {
      throw new Error("About page update did not produce a document.");
    }

    return ok({ about: serializeAbout(updated) });
  } catch (error) {
    console.error("Update about error", error);
    return fail("Server error", 500);
  }
}
