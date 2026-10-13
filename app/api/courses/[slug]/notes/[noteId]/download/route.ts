import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { fail } from "@/lib/api-response";
import { coursesCol } from "@/lib/collections";
import { getEnrollmentAccess } from "@/lib/enrollment";
import {
  getAuthenticatedRawUrl,
  getPrivateRawDownloadUrl,
} from "@/lib/cloudinary";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
    const { slug, noteId } = params;
    if (!ObjectId.isValid(noteId)) return fail("Invalid class note.", 400);

    const course = await (await coursesCol()).findOne({ slug });
    if (!course) return fail("Course not found.", 404);

    const segment = (course.segments ?? []).find((item) =>
      item.subSegments?.some((note) => note._id.toString() === noteId),
    );
    const note = segment?.subSegments?.find(
      (item) => item._id.toString() === noteId && item.kind === "note",
    );
    if (!note) return fail("Class note not found.", 404);
    if (!note.payload.pdfUrl) return fail("Class note file is unavailable.", 404);

    const access = await getEnrollmentAccess(
      new ObjectId(session!.userId),
      course._id,
    );
    const hasAccess =
      access.hasAccess ||
      (course.price === 0 && course.programKind !== "exam") ||
      segment?.isFree ||
      note.isFree;
    if (!hasAccess) return fail("You do not have access to this class note.", 403);

    let sourceUrl: URL;
    try {
      sourceUrl = new URL(note.payload.pdfUrl);
    } catch {
      return fail("Class note file is unavailable.", 502);
    }

    if (
      sourceUrl.protocol !== "https:" ||
      sourceUrl.hostname !== "res.cloudinary.com"
    ) {
      return fail("Unable to fetch the class note file.", 502);
    }

    const isAuthenticatedRaw =
      sourceUrl.pathname.includes("/raw/authenticated/");
    let downloadUrl = isAuthenticatedRaw
      ? note.payload.pdfPublicId
        ? getAuthenticatedRawUrl(note.payload.pdfPublicId)
        : null
      : note.payload.pdfUrl;
    if (!downloadUrl) {
      console.error("Authenticated class note has no Cloudinary public ID", {
        courseId: course._id.toString(),
        noteId,
      });
      return fail("Unable to fetch the class note file.", 502);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    let upstream: Response;
    try {
      upstream = await fetch(downloadUrl, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (
        (!upstream.ok || !upstream.body) &&
        (upstream.status === 401 || upstream.status === 403) &&
        note.payload.pdfPublicId
      ) {
        const deliveryType = sourceUrl.pathname.includes("/raw/authenticated/")
          ? "authenticated"
          : sourceUrl.pathname.includes("/raw/private/")
            ? "private"
            : "upload";
        downloadUrl = getPrivateRawDownloadUrl(
          note.payload.pdfPublicId,
          "pdf",
          deliveryType,
        );
        upstream = await fetch(downloadUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error("Fetch class note from Cloudinary failed", {
        courseId: course._id.toString(),
        noteId,
        error,
      });
      return fail("Unable to fetch the class note file.", 502);
    }

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timeout);
      console.error("Cloudinary class note download failed", {
        courseId: course._id.toString(),
        noteId,
        status: upstream.status,
      });
      return fail("Unable to fetch the class note file.", 502);
    }

    const safeName =
      note.title
        .replace(/[^a-zA-Z0-9-_ ]+/g, " ")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase() || "class-note";
    const reader = upstream.body.getReader();
    const stream = new ReadableStream<Uint8Array>({
      async pull(streamController) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            clearTimeout(timeout);
            streamController.close();
            return;
          }
          streamController.enqueue(value);
        } catch (error) {
          clearTimeout(timeout);
          streamController.error(error);
        }
      },
      async cancel() {
        clearTimeout(timeout);
        await reader.cancel();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
);
