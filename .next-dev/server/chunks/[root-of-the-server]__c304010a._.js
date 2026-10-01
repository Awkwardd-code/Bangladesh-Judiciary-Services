module.exports = [
"[project]/.next-internal/server/app/api/user/profile/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[project]/lib/api-response.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fail",
    ()=>fail,
    "ok",
    ()=>ok
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
function ok(data, status = 200) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data
    }, {
        status
    });
}
function fail(message, status = 400, extra) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: message,
        ...extra
    }, {
        status
    });
}
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
        if (typeof payload.userId !== "string" || payload.role !== "student" && payload.role !== "admin" || payload.tier !== "UNIVERSITY" && payload.tier !== "OTHER") {
            return null;
        }
        return {
            userId: payload.userId,
            role: payload.role,
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
"[project]/lib/auth-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin,
    "requireSession",
    ()=>requireSession,
    "requireStudent",
    ()=>requireStudent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
;
async function requireSession() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSessionFromCookies"])();
}
async function requireAdmin() {
    const session = await requireSession();
    return session?.role === "admin" ? session : null;
}
async function requireStudent() {
    const session = await requireSession();
    return session?.role === "student" ? session : null;
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
    "mentorsCol",
    ()=>mentorsCol,
    "passwordResetTokensCol",
    ()=>passwordResetTokensCol,
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
    await users.createIndex({
        email: 1
    }, {
        unique: true
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
    indexesReady = true;
// NOTE: call ensureIndexes() inside getDb()-adjacent helpers or
// at the top of API routes on first DB access. Prefer a single
// call inside each top-level route handler that writes data.
}
}),
"[project]/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getClientIp",
    ()=>getClientIp,
    "rateLimit",
    ()=>rateLimit
]);
const entries = new Map();
function rateLimit(options) {
    const now = Date.now();
    const existing = entries.get(options.key);
    if (!existing || existing.resetAt <= now) {
        const entry = {
            count: 1,
            resetAt: now + options.windowMs
        };
        entries.set(options.key, entry);
        return {
            allowed: true,
            remaining: options.limit - 1,
            resetAt: entry.resetAt
        };
    }
    existing.count += 1;
    return {
        allowed: existing.count <= options.limit,
        remaining: Math.max(0, options.limit - existing.count),
        resetAt: existing.resetAt
    };
}
function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const requestWithIp = req;
    return forwarded?.split(",")[0]?.trim() || requestWithIp.ip || "unknown";
}
}),
"[project]/app/api/user/profile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-response.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/collections.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/indexes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rate-limit.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const profileSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(80).optional(),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(20).optional(),
    avatarUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().nullable().optional(),
    avatarPublicId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).nullable().optional()
}).strict();
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
    if (!session) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Not authenticated", 401);
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureIndexes"])();
        const user = await (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usersCol"])()).findOne({
            _id: new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](session.userId)
        });
        if (!user) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("User not found", 404);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                tier: user.tier,
                roll: user.roll ?? null,
                university: user.university ?? null,
                studentId: user.studentId ?? null,
                phone: user.phone ?? null,
                avatarUrl: user.avatarUrl ?? null,
                avatarPublicId: user.avatarPublicId ?? null,
                verified: user.verified,
                approved: user.approved,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt ?? null
            }
        });
    } catch (error) {
        console.error("Profile lookup error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Server error", 500);
    }
}
async function PATCH(req) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
    if (!session) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Not authenticated", 401);
    }
    const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])({
        key: `profile:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIp"])(req)}`,
        limit: 10,
        windowMs: 60_000
    });
    if (!limit.allowed) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Too many requests", 429);
    }
    let body;
    try {
        body = await req.json();
    } catch  {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Invalid request", 400);
    }
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])(parsed.error.issues[0]?.message ?? "Invalid profile", 400);
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureIndexes"])();
        const userCollection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["usersCol"])();
        const user = await userCollection.findOne({
            _id: new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$29$__["ObjectId"](session.userId)
        });
        if (!user) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("User not found", 404);
        }
        const updateSet = {
            updatedAt: new Date()
        };
        if (parsed.data.name !== undefined) {
            updateSet.name = parsed.data.name;
        }
        if (parsed.data.phone !== undefined) {
            updateSet.phone = parsed.data.phone;
        }
        if (parsed.data.avatarUrl === null) {
            await userCollection.updateOne({
                _id: user._id
            }, {
                $unset: {
                    avatarUrl: "",
                    avatarPublicId: ""
                },
                $set: {
                    updatedAt: new Date()
                }
            });
        } else {
            if (parsed.data.avatarUrl !== undefined) {
                updateSet.avatarUrl = parsed.data.avatarUrl;
            }
            if (parsed.data.avatarPublicId !== undefined) {
                updateSet.avatarPublicId = parsed.data.avatarPublicId;
            }
            await userCollection.updateOne({
                _id: user._id
            }, {
                $set: updateSet
            });
        }
        const updatedUser = await userCollection.findOne({
            _id: user._id
        });
        if (!updatedUser) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("User not found", 404);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            user: {
                id: updatedUser._id.toString(),
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                tier: updatedUser.tier,
                phone: updatedUser.phone ?? null,
                roll: updatedUser.roll ?? null,
                university: updatedUser.university ?? null,
                studentId: updatedUser.studentId ?? null,
                avatarUrl: updatedUser.avatarUrl ?? null,
                avatarPublicId: updatedUser.avatarPublicId ?? null,
                verified: updatedUser.verified,
                createdAt: updatedUser.createdAt,
                lastLoginAt: updatedUser.lastLoginAt ?? null
            }
        });
    } catch (error) {
        console.error("Profile update error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Server error", 500);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c304010a._.js.map