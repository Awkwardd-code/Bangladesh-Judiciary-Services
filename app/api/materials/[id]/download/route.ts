import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { fail, ok } from "@/lib/api-response";
import { coursesCol, materialsCol } from "@/lib/collections";
import {
  getAuthenticatedRawUrl,
  getPrivateRawDownloadUrl,
} from "@/lib/cloudinary";
import { ensureIndexes } from "@/lib/indexes";
import { getEnrollmentAccess } from "@/lib/enrollment";
import { withGuard } from "@/lib/route-guard";

export const GET = withGuard(
  { kind: "session" },
  async (_request, { params, session }) => {
    try {
      await ensureIndexes();

      const { id } = params;
      if (!ObjectId.isValid(id)) return fail("Invalid material id", 400);

      const material = await (await materialsCol()).findOne({
        _id: new ObjectId(id),
      });
      if (!material) return fail("Material not found", 404);

      const course = await (await coursesCol()).findOne({
        _id: material.courseId,
      });
      if (!course) return fail("Course not found", 404);

      const access = await getEnrollmentAccess(
        new ObjectId(session!.userId),
        material.courseId,
      );
      if (!access.hasAccess && !material.isFreePreview) {
        return fail("You do not have access to this material.", 403);
      }

      if (material.kind === "link") {
        return ok({ redirect: material.url });
      }
      if (!material.url) return fail("Material is unavailable", 404);

      const sourceUrl = new URL(material.url);
      if (
        sourceUrl.protocol !== "https:" ||
        sourceUrl.hostname !== "res.cloudinary.com"
      ) {
        return fail("Unable to fetch the file.", 502);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      let upstream: Response;

      try {
        const isAuthenticatedRaw =
          sourceUrl.pathname.includes("/raw/authenticated/");
        const downloadUrl = isAuthenticatedRaw
          ? material.publicId
            ? getAuthenticatedRawUrl(material.publicId)
            : null
          : material.url;
        if (!downloadUrl) {
          clearTimeout(timeout);
          console.error("Authenticated Cloudinary material has no public ID", {
            materialId: material._id.toString(),
          });
          return fail("Unable to fetch the file.", 502);
        }

        upstream = await fetch(downloadUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error("Fetch material from Cloudinary failed", error);
        return fail("Unable to fetch the file.", 502);
      }

      let usedPrivateDownload = false;
      if (
        (!upstream.ok || !upstream.body) &&
        (upstream.status === 401 || upstream.status === 403) &&
        material.publicId
      ) {
        const format =
          sourceUrl.pathname.match(/\.(pdf|docx?)$/i)?.[1]?.toLowerCase() ??
          (material.kind === "doc" ? "doc" : "pdf");
        const deliveryType = sourceUrl.pathname.includes("/raw/authenticated/")
          ? "authenticated"
          : sourceUrl.pathname.includes("/raw/private/")
            ? "private"
            : "upload";
        const privateDownloadUrl = getPrivateRawDownloadUrl(
          material.publicId,
          format,
          deliveryType,
        );

        try {
          upstream = await fetch(privateDownloadUrl, {
            cache: "no-store",
            signal: controller.signal,
          });
          usedPrivateDownload = true;
        } catch (error) {
          clearTimeout(timeout);
          console.error("Private Cloudinary material download failed", {
            materialId: material._id.toString(),
            error,
          });
          return fail("Unable to fetch the file.", 502);
        }
      }

      if (!upstream.ok || !upstream.body) {
        clearTimeout(timeout);
        const cloudinaryError = (await upstream.clone().text()).slice(0, 500);
        console.error("Cloudinary material download failed", {
          materialId: material._id.toString(),
          status: upstream.status,
          hasPublicId: Boolean(material.publicId),
          usedPrivateDownload,
          cloudinaryError,
        });
        if (cloudinaryError.includes('actions=["download"]')) {
          return fail(
            "Cloudinary denied the download because the configured API key lacks the download permission. Grant this API key download access in Cloudinary, or enable public PDF/ZIP delivery for the asset.",
            502,
          );
        }
        if (upstream.status === 401 || upstream.status === 403) {
          return fail(
            "Cloudinary denied access to this file. Check the Cloudinary API credentials and asset delivery type.",
            502,
          );
        }
        return fail("Unable to fetch the file.", 502);
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("[material/download]", {
          materialId: material._id.toString(),
          userId: session!.userId,
          courseId: material.courseId.toString(),
        });
      }

      const safeName =
        material.title
          .replace(/[^a-zA-Z0-9-_ ]+/g, " ")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase() || "material";
      const urlExtension = sourceUrl.pathname.match(/\.(pdf|docx?)$/i)?.[1];
      const extension =
        urlExtension?.toLowerCase() ??
        (material.kind === "doc" ? "doc" : "pdf");
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
            upstream.headers.get("content-type") ??
            "application/octet-stream",
          "Content-Disposition":
            `attachment; filename="${safeName}.${extension}"`,
          "Cache-Control": "private, no-store",
        },
      });
    } catch (error) {
      console.error("Material download error", error);
      return fail("Unable to fetch the file.", 502);
    }
  },
);
