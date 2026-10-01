import { getDb } from "./db";

let indexesReady = false;

export async function ensureIndexes(): Promise<void> {
  if (indexesReady) {
    return;
  }

  const db = await getDb();

  const users = db.collection("users");
  const pendingRegistrations = db.collection("pending_registrations");
  const passwordResetTokens = db.collection("password_reset_tokens");
  const preliminaryExams = db.collection("preliminary_exams");
  const preliminaryQuestions = db.collection("preliminary_questions");
  const preliminaryAttempts = db.collection("preliminary_attempts");
  const writtenExams = db.collection("written_exams");
  const writtenQuestions = db.collection("written_questions");
  const writtenSubmissions = db.collection("written_submissions");
  const mentors = db.collection("mentors");
  const successStories = db.collection("success_stories");
  const about = db.collection("about");
  const notices = db.collection("notices");
  const payments = db.collection("payments");
  const courses = db.collection("courses");
  const enrollments = db.collection("enrollments");
  const contactMessages = db.collection("contact_messages");
  const authAudit = db.collection("auth_audit");

  await users.createIndex({ email: 1 }, { unique: true });
  await users.updateMany(
    { isAdmin: { $exists: false } },
    { $set: { isAdmin: 0 } },
  );
  await users.updateMany(
    { sessionVersion: { $exists: false } },
    { $set: { sessionVersion: 1 } },
  );
  await users.updateMany(
    { disabled: { $exists: false } },
    { $set: { disabled: false } },
  );
  await users.createIndex({ roll: 1 }, { unique: true, sparse: true });
  await users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
  await users.createIndex({ createdAt: -1 });

  await pendingRegistrations.createIndex({ email: 1 }, { unique: true });
  await pendingRegistrations.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );

  await passwordResetTokens.createIndex({ token: 1 }, { unique: true });
  await passwordResetTokens.createIndex({ userId: 1 });
  await passwordResetTokens.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );

  await preliminaryExams.createIndex({ status: 1, scheduledAt: -1 });

  await preliminaryQuestions.createIndex(
    { examId: 1, order: 1 },
    { unique: true },
  );

  await preliminaryAttempts.createIndex({
    examId: 1,
    userId: 1,
    createdAt: -1,
  });
  await preliminaryAttempts.createIndex({
    examId: 1,
    score: -1,
    submittedAt: 1,
  });
  await preliminaryAttempts.createIndex(
    { userId: 1 },
    {
      unique: true,
      partialFilterExpression: { activeLock: true },
    },
  );

  await writtenExams.createIndex({ status: 1, scheduledAt: -1 });

  await writtenQuestions.createIndex({ examId: 1, order: 1 }, { unique: true });

  await writtenSubmissions.createIndex(
    { userId: 1, examId: 1 },
    { unique: true },
  );
  await writtenSubmissions.createIndex({
    status: 1,
    submittedAt: -1,
  });
  await writtenSubmissions.createIndex(
    { userId: 1 },
    {
      unique: true,
      partialFilterExpression: { activeLock: true },
    },
  );

  await mentors.createIndex({ isPublished: 1, order: 1, _id: 1 });
  await mentors.createIndex({ name: 1 }, { sparse: true });

  await successStories.createIndex({
    status: 1,
    isFeatured: -1,
    order: 1,
    createdAt: -1,
  });
  await successStories.createIndex({ authorEmail: 1 });
  await successStories.createIndex({ reviewedBy: 1 });

  await about.createIndex({ updatedAt: -1 });
  await notices.createIndex({ status: 1, pinned: -1, publishedAt: -1 });
  await payments.createIndex({ status: 1, paidAt: -1 });
  await payments.createIndex({ userId: 1 });

  await courses.createIndex({ status: 1, order: 1 });
  await courses.createIndex({ slug: 1 }, { unique: true });

  await enrollments.createIndex({ userId: 1, courseId: 1 }, { unique: true });
  await enrollments.createIndex({ status: 1, createdAt: -1 });
  await enrollments.createIndex({ courseId: 1, status: 1 });
  await contactMessages.createIndex({ status: 1, createdAt: -1 });

  await authAudit.createIndex({ userId: 1, createdAt: -1 });
  await authAudit.createIndex({ action: 1, createdAt: -1 });
  await authAudit.createIndex({ email: 1, createdAt: -1 });
  await authAudit.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 },
  );

  indexesReady = true;

  // NOTE: call ensureIndexes() inside getDb()-adjacent helpers or
  // at the top of API routes on first DB access. Prefer a single
  // call inside each top-level route handler that writes data.
}
