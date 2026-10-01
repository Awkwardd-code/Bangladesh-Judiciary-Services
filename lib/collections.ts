import type { Collection } from "mongodb";

import { getDb } from "./db";
import type { About } from "./types/about";
import type { Mentor } from "./types/mentor";
import type { SuccessStory } from "./types/success-story";
import type { PasswordResetToken } from "./types/password-reset-token";
import type { PendingRegistration } from "./types/pending-registration";
import type {
  PreliminaryAttempt,
  PreliminaryExam,
  PreliminaryQuestion,
  WrittenExam,
  WrittenQuestion,
  WrittenSubmission,
} from "./types/exam";
import type { User } from "./types/user";
import type { Notice } from "./types/notice";
import type { Payment } from "./types/payment";
import type { Course, Enrollment } from "./types/course";
import type { ContactMessage } from "./types/contact-message";
import type { AuthAudit } from "./types/auth-audit";

export async function usersCol(): Promise<Collection<User>> {
  return (await getDb()).collection<User>("users");
}

export async function pendingRegistrationsCol(): Promise<
  Collection<PendingRegistration>
> {
  return (await getDb()).collection<PendingRegistration>(
    "pending_registrations",
  );
}

export async function passwordResetTokensCol(): Promise<
  Collection<PasswordResetToken>
> {
  return (await getDb()).collection<PasswordResetToken>(
    "password_reset_tokens",
  );
}

export async function preliminaryExamsCol(): Promise<
  Collection<PreliminaryExam>
> {
  return (await getDb()).collection<PreliminaryExam>("preliminary_exams");
}

export async function preliminaryQuestionsCol(): Promise<
  Collection<PreliminaryQuestion>
> {
  return (await getDb()).collection<PreliminaryQuestion>(
    "preliminary_questions",
  );
}

export async function preliminaryAttemptsCol(): Promise<
  Collection<PreliminaryAttempt>
> {
  return (await getDb()).collection<PreliminaryAttempt>("preliminary_attempts");
}

export async function writtenExamsCol(): Promise<Collection<WrittenExam>> {
  return (await getDb()).collection<WrittenExam>("written_exams");
}

export async function writtenQuestionsCol(): Promise<
  Collection<WrittenQuestion>
> {
  return (await getDb()).collection<WrittenQuestion>("written_questions");
}

export async function writtenSubmissionsCol(): Promise<
  Collection<WrittenSubmission>
> {
  return (await getDb()).collection<WrittenSubmission>("written_submissions");
}

export async function mentorsCol(): Promise<Collection<Mentor>> {
  return (await getDb()).collection<Mentor>("mentors");
}

export async function successStoriesCol(): Promise<Collection<SuccessStory>> {
  return (await getDb()).collection<SuccessStory>("success_stories");
}

export async function aboutsCol(): Promise<Collection<About>> {
  return (await getDb()).collection<About>("about");
}

export async function noticesCol(): Promise<Collection<Notice>> {
  return (await getDb()).collection<Notice>("notices");
}

export async function paymentsCol(): Promise<Collection<Payment>> {
  return (await getDb()).collection<Payment>("payments");
}

export async function coursesCol(): Promise<Collection<Course>> {
  return (await getDb()).collection<Course>("courses");
}

export async function enrollmentsCol(): Promise<Collection<Enrollment>> {
  return (await getDb()).collection<Enrollment>("enrollments");
}

export async function contactMessagesCol(): Promise<Collection<ContactMessage>> {
  return (await getDb()).collection<ContactMessage>("contact_messages");
}

export async function authAuditCol(): Promise<Collection<AuthAudit>> {
  return (await getDb()).collection<AuthAudit>("auth_audit");
}
