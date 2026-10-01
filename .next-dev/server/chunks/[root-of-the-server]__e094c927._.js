module.exports = [
"[project]/.next-internal/server/app/api/auth/google/callback/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "env",
    ()=>env
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
function readEnvValue(name) {
    const existing = process.env[name];
    if (existing && existing.trim()) {
        return existing.trim();
    }
    const envPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"](process.cwd(), ".env.local");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"](envPath)) {
        return undefined;
    }
    for (const line of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"](envPath, "utf8").split(/\r?\n/)){
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const equalsIndex = trimmed.indexOf("=");
        if (equalsIndex === -1) {
            continue;
        }
        const key = trimmed.slice(0, equalsIndex).trim();
        const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
        if (key === name) {
            return value;
        }
    }
    return undefined;
}
function readRequiredEnv(name, fallback) {
    const value = readEnvValue(name) || fallback;
    if (!value) {
        if (process.env.NEXT_PHASE === "phase-production-build") {
            return `__MISSING_${name}__`;
        }
        throw new Error(`${name} is not set in environment variables.`);
    }
    return value;
}
const env = {
    MONGODB_URI: readRequiredEnv("MONGODB_URI"),
    JWT_SECRET: readRequiredEnv("JWT_SECRET"),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SMTP_HOST: readRequiredEnv("SMTP_HOST", "smtp.gmail.com"),
    SMTP_PORT: Number(readRequiredEnv("SMTP_PORT", "465")),
    SMTP_SECURE: readRequiredEnv("SMTP_SECURE", "true") === "true",
    SMTP_USER: readRequiredEnv("SMTP_USER", process.env.GMAIL_USER),
    SMTP_PASSWORD: readRequiredEnv("SMTP_PASSWORD", process.env.GMAIL_APP_PASSWORD),
    NEXT_PUBLIC_APP_URL: readRequiredEnv("NEXT_PUBLIC_APP_URL"),
    CLOUDINARY_CLOUD_NAME: readRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: readRequiredEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: readRequiredEnv("CLOUDINARY_API_SECRET")
};
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AUTH_COOKIE_NAME",
    ()=>AUTH_COOKIE_NAME,
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "getSessionFromCookies",
    ()=>getSessionFromCookies,
    "setSessionCookie",
    ()=>setSessionCookie,
    "signSession",
    ()=>signSession,
    "verifySession",
    ()=>verifySession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
;
;
;
const AUTH_COOKIE_NAME = "bjs_auth";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const secret = new TextEncoder().encode(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].JWT_SECRET);
async function signSession(payload) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime("7d").sign(secret);
}
async function verifySession(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret, {
            algorithms: [
                "HS256"
            ]
        });
        if (typeof payload.userId !== "string" || payload.role !== "student" && payload.role !== "admin" || payload.isAdmin !== undefined && payload.isAdmin !== 0 && payload.isAdmin !== 1 || payload.tier !== "UNIVERSITY" && payload.tier !== "OTHER") {
            return null;
        }
        return {
            userId: payload.userId,
            role: payload.role,
            isAdmin: payload.isAdmin === 1 || payload.isAdmin === undefined && payload.role === "admin" ? 1 : 0,
            tier: payload.tier
        };
    } catch  {
        return null;
    }
}
async function getSessionFromCookies() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
        return null;
    }
    return verifySession(token);
}
async function setSessionCookie(token, remember = true) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: remember ? SESSION_MAX_AGE : undefined
    });
}
async function clearSessionCookie() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0
    });
}
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
function getEnvValue(name) {
    const existing = process.env[name];
    if (existing?.trim()) {
        return existing.trim();
    }
    const envPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["resolve"](process.cwd(), ".env.local");
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"](envPath)) {
        return undefined;
    }
    for (const line of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"](envPath, "utf8").split(/\r?\n/)){
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const equalsIndex = trimmed.indexOf("=");
        if (equalsIndex === -1) {
            continue;
        }
        const key = trimmed.slice(0, equalsIndex).trim();
        const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, "");
        if (key === name) {
            return value;
        }
    }
    return undefined;
}
const globalWithMongo = globalThis;
const cached = globalWithMongo.__bjsMongo ?? {
    client: null,
    db: null,
    promise: null
};
if (!globalWithMongo.__bjsMongo) {
    globalWithMongo.__bjsMongo = cached;
}
async function getDb() {
    if (cached.db) {
        return cached.db;
    }
    if (!cached.promise) {
        const uri = getEnvValue("MONGODB_URI");
        if (!uri) {
            throw new Error("MONGODB_URI is not set.");
        }
        console.log("MongoDB URI detected:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"));
        const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["MongoClient"](uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        cached.promise = client.connect().then((connectedClient)=>{
            cached.client = connectedClient;
            cached.db = connectedClient.db("bjs-prep");
            console.log("MongoDB connected successfully.");
            return cached.db;
        }).catch((error)=>{
            cached.promise = null;
            console.error("MongoDB connection failed:", error);
            throw error;
        });
    }
    return cached.promise;
}
}),
"[project]/lib/collections.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aboutsCol",
    ()=>aboutsCol,
    "contactMessagesCol",
    ()=>contactMessagesCol,
    "coursesCol",
    ()=>coursesCol,
    "enrollmentsCol",
    ()=>enrollmentsCol,
    "mentorsCol",
    ()=>mentorsCol,
    "noticesCol",
    ()=>noticesCol,
    "passwordResetTokensCol",
    ()=>passwordResetTokensCol,
    "paymentsCol",
    ()=>paymentsCol,
    "pendingRegistrationsCol",
    ()=>pendingRegistrationsCol,
    "preliminaryAttemptsCol",
    ()=>preliminaryAttemptsCol,
    "preliminaryExamsCol",
    ()=>preliminaryExamsCol,
    "preliminaryQuestionsCol",
    ()=>preliminaryQuestionsCol,
    "successStoriesCol",
    ()=>successStoriesCol,
    "usersCol",
    ()=>usersCol,
    "writtenExamsCol",
    ()=>writtenExamsCol,
    "writtenQuestionsCol",
    ()=>writtenQuestionsCol,
    "writtenSubmissionsCol",
    ()=>writtenSubmissionsCol
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
async function usersCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("users");
}
async function pendingRegistrationsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("pending_registrations");
}
async function passwordResetTokensCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("password_reset_tokens");
}
async function preliminaryExamsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("preliminary_exams");
}
async function preliminaryQuestionsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("preliminary_questions");
}
async function preliminaryAttemptsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("preliminary_attempts");
}
async function writtenExamsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("written_exams");
}
async function writtenQuestionsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("written_questions");
}
async function writtenSubmissionsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("written_submissions");
}
async function mentorsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("mentors");
}
async function successStoriesCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("success_stories");
}
async function aboutsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("about");
}
async function noticesCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("notices");
}
async function paymentsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("payments");
}
async function coursesCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("courses");
}
async function enrollmentsCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("enrollments");
}
async function contactMessagesCol() {
    return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])()).collection("contact_messages");
}
}),
"[project]/lib/indexes.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureIndexes",
    ()=>ensureIndexes
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
let indexesReady = false;
async function ensureIndexes() {
    if (indexesReady) {
        return;
    }
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
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
    await users.createIndex({
        email: 1
    }, {
        unique: true
    });
    await users.updateMany({
        isAdmin: {
            $exists: false
        }
    }, {
        $set: {
            isAdmin: 0
        }
    });
    await users.createIndex({
        roll: 1
    }, {
        unique: true,
        sparse: true
    });
    await users.createIndex({
        studentId: 1
    }, {
        unique: true,
        sparse: true
    });
    await users.createIndex({
        createdAt: -1
    });
    await pendingRegistrations.createIndex({
        email: 1
    }, {
        unique: true
    });
    await pendingRegistrations.createIndex({
        expiresAt: 1
    }, {
        expireAfterSeconds: 0
    });
    await passwordResetTokens.createIndex({
        token: 1
    }, {
        unique: true
    });
    await passwordResetTokens.createIndex({
        userId: 1
    });
    await passwordResetTokens.createIndex({
        expiresAt: 1
    }, {
        expireAfterSeconds: 0
    });
    await preliminaryExams.createIndex({
        status: 1,
        scheduledAt: -1
    });
    await preliminaryQuestions.createIndex({
        examId: 1,
        order: 1
    }, {
        unique: true
    });
    await preliminaryAttempts.createIndex({
        examId: 1,
        userId: 1,
        createdAt: -1
    });
    await preliminaryAttempts.createIndex({
        examId: 1,
        score: -1,
        submittedAt: 1
    });
    await preliminaryAttempts.createIndex({
        userId: 1
    }, {
        unique: true,
        partialFilterExpression: {
            activeLock: true
        }
    });
    await writtenExams.createIndex({
        status: 1,
        scheduledAt: -1
    });
    await writtenQuestions.createIndex({
        examId: 1,
        order: 1
    }, {
        unique: true
    });
    await writtenSubmissions.createIndex({
        userId: 1,
        examId: 1
    }, {
        unique: true
    });
    await writtenSubmissions.createIndex({
        status: 1,
        submittedAt: -1
    });
    await writtenSubmissions.createIndex({
        userId: 1
    }, {
        unique: true,
        partialFilterExpression: {
            activeLock: true
        }
    });
    await mentors.createIndex({
        isPublished: 1,
        order: 1,
        _id: 1
    });
    await mentors.createIndex({
        name: 1
    }, {
        sparse: true
    });
    await successStories.createIndex({
        status: 1,
        isFeatured: -1,
        order: 1,
        createdAt: -1
    });
    await successStories.createIndex({
        authorEmail: 1
    });
    await successStories.createIndex({
        reviewedBy: 1
    });
    await about.createIndex({
        updatedAt: -1
    });
    await notices.createIndex({
        status: 1,
        pinned: -1,
        publishedAt: -1
    });
    await payments.createIndex({
        status: 1,
        paidAt: -1
    });
    await payments.createIndex({
        userId: 1
    });
    await courses.createIndex({
        status: 1,
        order: 1
    });
    await courses.createIndex({
        slug: 1
    }, {
        unique: true
    });
    await enrollments.createIndex({
        userId: 1,
        courseId: 1
    }, {
        unique: true
    });
    await enrollments.createIndex({
        status: 1,
        createdAt: -1
    });
    await enrollments.createIndex({
        courseId: 1,
        status: 1
    });
    await contactMessages.createIndex({
        status: 1,
        createdAt: -1
    });
    indexesReady = true;
// NOTE: call ensureIndexes() inside getDb()-adjacent helpers or
// at the top of API routes on first DB access. Prefer a single
// call inside each top-level route handler that writes data.
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/password.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
async function hashPassword(plain) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(plain, 10);
}
async function verifyPassword(plain, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(plain, hash);
}
}),
"[project]/app/api/auth/google/callback/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwks$2f$remote$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwks/remote.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/collections.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/indexes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/password.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const STATE_COOKIE = "bjs_google_oauth";
const googleJwks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwks$2f$remote$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRemoteJWKSet"])(new URL("https://www.googleapis.com/oauth2/v3/certs"));
async function GET(req) {
    const storedState = readOAuthState(req.cookies.get(STATE_COOKIE)?.value);
    const stateParam = req.nextUrl.searchParams.get("state");
    const code = req.nextUrl.searchParams.get("code");
    if (!storedState || !stateParam || storedState.state !== stateParam || !code || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GOOGLE_CLIENT_ID || !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GOOGLE_CLIENT_SECRET) {
        return loginRedirect("google");
    }
    try {
        const callbackUrl = new URL("/api/auth/google/callback", __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_APP_URL);
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                code,
                client_id: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GOOGLE_CLIENT_ID,
                client_secret: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GOOGLE_CLIENT_SECRET,
                redirect_uri: callbackUrl.toString(),
                grant_type: "authorization_code",
                code_verifier: storedState.verifier
            }),
            cache: "no-store"
        });
        if (!tokenResponse.ok) {
            return loginRedirect("google");
        }
        const tokens = await tokenResponse.json();
        if (!tokens.id_token) {
            return loginRedirect("google");
        }
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(tokens.id_token, googleJwks, {
            audience: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].GOOGLE_CLIENT_ID,
            issuer: [
                "https://accounts.google.com",
                "accounts.google.com"
            ]
        });
        const googleId = payload.sub;
        const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
        const name = typeof payload.name === "string" ? payload.name.trim() : "";
        const picture = typeof payload.picture === "string" ? payload.picture : null;
        if (payload.nonce !== storedState.nonce || typeof googleId !== "string" || !email || payload.email_verified !== true) {
            return loginRedirect("google");
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureIndexes"])();
        const users = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usersCol"])();
        let user = await users.findOne({
            email
        });
        if (user?.googleId && user.googleId !== googleId) {
            return loginRedirect("google");
        }
        if (user) {
            const now = new Date();
            const profileUpdates = {
                ...name && !user.name.trim() ? {
                    name
                } : {},
                ...picture && !user.avatarUrl?.trim() ? {
                    avatarUrl: picture
                } : {}
            };
            await users.updateOne({
                _id: user._id
            }, {
                $set: {
                    googleId,
                    verified: true,
                    ...profileUpdates,
                    lastLoginAt: now,
                    updatedAt: now
                }
            });
            user = {
                ...user,
                googleId,
                verified: true,
                name: user.name.trim() ? user.name : name || user.name,
                avatarUrl: user.avatarUrl?.trim() ? user.avatarUrl : picture ?? undefined,
                lastLoginAt: now
            };
        } else {
            const now = new Date();
            const password = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(32).toString("base64url"));
            const result = await users.insertOne({
                _id: new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](),
                name: name || email.split("@")[0],
                email,
                password,
                googleId,
                role: "student",
                isAdmin: 0,
                tier: "OTHER",
                avatarUrl: picture ?? undefined,
                verified: true,
                approved: true,
                createdAt: now,
                updatedAt: now,
                lastLoginAt: now
            });
            user = {
                _id: result.insertedId,
                name: name || email.split("@")[0],
                email,
                password,
                googleId,
                role: "student",
                isAdmin: 0,
                tier: "OTHER",
                avatarUrl: picture ?? undefined,
                verified: true,
                approved: true,
                createdAt: now,
                updatedAt: now,
                lastLoginAt: now
            };
        }
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signSession"])({
            userId: user._id.toString(),
            role: user.isAdmin === 1 ? "admin" : "student",
            isAdmin: user.isAdmin === 1 ? 1 : 0,
            tier: user.tier
        });
        const destination = new URL(user.isAdmin === 1 ? "/admin" : safeNextPath(storedState.nextPath), __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_APP_URL);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(destination);
        response.cookies.set(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AUTH_COOKIE_NAME"], session, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });
        clearOAuthCookie(response);
        return response;
    } catch (error) {
        console.error("Google sign-in error", error);
        return loginRedirect("google");
    }
}
function readOAuthState(value) {
    if (!value) {
        return null;
    }
    try {
        const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
        if (typeof parsed.state !== "string" || typeof parsed.nonce !== "string" || typeof parsed.verifier !== "string" || typeof parsed.nextPath !== "string") {
            return null;
        }
        return parsed;
    } catch  {
        return null;
    }
}
function safeNextPath(value) {
    if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
        return "/dashboard";
    }
    return value;
}
function loginRedirect(error) {
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/login?error=${encodeURIComponent(error)}`, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["env"].NEXT_PUBLIC_APP_URL));
    clearOAuthCookie(response);
    return response;
}
function clearOAuthCookie(response) {
    response.cookies.set(STATE_COOKIE, "", {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === "production",
        sameSite: "lax",
        path: "/api/auth/google",
        maxAge: 0
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e094c927._.js.map