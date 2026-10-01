module.exports = [
"[project]/.next-internal/server/app/api/dashboard/stats/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

module.exports = mod;
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
"[project]/lib/stats.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDashboardStats",
    ()=>getDashboardStats,
    "getRecentAttempts",
    ()=>getRecentAttempts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
const emptyStats = {
    totals: {
        students: 0,
        questions: 0,
        mockExams: 0,
        attempts: 0
    },
    successRate: 0,
    recentAttempts: [],
    tierDistribution: [],
    topSubjects: [],
    attemptStatuses: []
};
async function getDashboardStats() {
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
        const users = db.collection("users");
        const questions = db.collection("preliminary_questions");
        const exams = db.collection("preliminary_exams");
        const attempts = db.collection("preliminary_attempts");
        const [students, questionCount, mockExams, attemptCount] = await Promise.all([
            users.countDocuments({
                role: "student"
            }),
            questions.countDocuments(),
            exams.countDocuments({
                status: "published"
            }),
            attempts.countDocuments()
        ]);
        const [successSummary, recentRows, tiers, subjects, statuses] = await Promise.all([
            attempts.aggregate([
                {
                    $lookup: {
                        from: "preliminary_exams",
                        localField: "examId",
                        foreignField: "_id",
                        as: "exam"
                    }
                },
                {
                    $unwind: {
                        path: "$exam",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        successful: {
                            $sum: {
                                $cond: [
                                    {
                                        $gte: [
                                            {
                                                $cond: [
                                                    {
                                                        $gt: [
                                                            "$exam.totalMarks",
                                                            0
                                                        ]
                                                    },
                                                    {
                                                        $divide: [
                                                            "$score",
                                                            "$exam.totalMarks"
                                                        ]
                                                    },
                                                    0
                                                ]
                                            },
                                            0.5
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                }
            ]).toArray(),
            attempts.aggregate([
                {
                    $match: {
                        startedAt: {
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $lookup: {
                        from: "preliminary_exams",
                        localField: "examId",
                        foreignField: "_id",
                        as: "exam"
                    }
                },
                {
                    $unwind: {
                        path: "$exam",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$startedAt"
                            }
                        },
                        attempts: {
                            $sum: 1
                        },
                        averageScore: {
                            $avg: {
                                $cond: [
                                    {
                                        $gt: [
                                            "$exam.totalMarks",
                                            0
                                        ]
                                    },
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$score",
                                                    "$exam.totalMarks"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]).toArray(),
            users.aggregate([
                {
                    $match: {
                        role: "student"
                    }
                },
                {
                    $group: {
                        _id: "$tier",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]).toArray(),
            questions.aggregate([
                {
                    $match: {
                        subject: {
                            $type: "string",
                            $ne: ""
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        subject: 1,
                        correctOptionIndex: 1
                    }
                },
                {
                    $lookup: {
                        from: "preliminary_attempts",
                        localField: "_id",
                        foreignField: "answers.questionId",
                        as: "attempts"
                    }
                },
                {
                    $unwind: "$attempts"
                },
                {
                    $unwind: "$attempts.answers"
                },
                {
                    $match: {
                        $expr: {
                            $eq: [
                                "$attempts.answers.questionId",
                                "$_id"
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$subject",
                        total: {
                            $sum: 1
                        },
                        correct: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$attempts.answers.selectedOptionIndex",
                                            "$correctOptionIndex"
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        subject: "$_id",
                        accuracy: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$correct",
                                                "$total"
                                            ]
                                        },
                                        100
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        accuracy: -1
                    }
                },
                {
                    $limit: 5
                }
            ]).toArray(),
            attempts.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]).toArray()
        ]);
        const days = new Map(recentRows.map((row)=>[
                String(row._id),
                {
                    attempts: Number(row.attempts) || 0,
                    averageScore: Math.round(Number(row.averageScore) || 0)
                }
            ]));
        const recentAttempts = Array.from({
            length: 30
        }, (_, index)=>{
            const day = new Date();
            day.setDate(day.getDate() - (29 - index));
            const date = day.toISOString().slice(0, 10);
            return {
                date,
                attempts: days.get(date)?.attempts ?? 0,
                averageScore: days.get(date)?.averageScore ?? 0
            };
        });
        const successCount = Number(successSummary[0]?.successful) || 0;
        const successTotal = Number(successSummary[0]?.count) || 0;
        return {
            totals: {
                students,
                questions: questionCount,
                mockExams,
                attempts: attemptCount
            },
            successRate: successTotal === 0 ? 0 : Math.round(successCount / successTotal * 1000) / 10,
            recentAttempts,
            tierDistribution: tiers.map((row)=>({
                    tier: String(row._id ?? "Other"),
                    count: Number(row.count) || 0
                })),
            topSubjects: subjects.map((row)=>({
                    subject: String(row.subject ?? "General"),
                    accuracy: Number(row.accuracy) || 0
                })),
            attemptStatuses: statuses.map((row)=>({
                    status: String(row._id ?? "unknown"),
                    count: Number(row.count) || 0
                }))
        };
    } catch (error) {
        console.error("Dashboard statistics lookup failed", error);
        return emptyStats;
    }
}
async function getRecentAttempts(userId, limit = 5) {
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
        const attempts = await db.collection("preliminary_attempts").aggregate([
            ...userId ? [
                {
                    $match: {
                        userId
                    }
                }
            ] : [],
            {
                $sort: {
                    startedAt: -1
                }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "preliminary_exams",
                    localField: "examId",
                    foreignField: "_id",
                    as: "exam"
                }
            },
            {
                $unwind: {
                    path: "$exam",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    startedAt: 1,
                    score: 1,
                    status: 1,
                    examTitle: "$exam.title",
                    totalMarks: "$exam.totalMarks"
                }
            }
        ]).toArray();
        return attempts.map((attempt)=>{
            const totalMarks = Number(attempt.totalMarks) || 0;
            const score = Number(attempt.score) || 0;
            return {
                id: String(attempt._id),
                subject: String(attempt.examTitle ?? "Mock exam"),
                date: new Date(attempt.startedAt).toISOString(),
                score,
                scorePercent: totalMarks > 0 ? Math.round(score / totalMarks * 100) : 0,
                status: String(attempt.status ?? "unknown")
            };
        });
    } catch (error) {
        console.error("Recent attempts lookup failed", error);
        return [];
    }
}
}),
"[project]/app/api/dashboard/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-response.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/indexes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stats.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
    if (!session) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Not authenticated", 401);
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureIndexes"])();
        const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stats$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDashboardStats"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            stats
        });
    } catch (error) {
        console.error("Dashboard stats route error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Unable to load dashboard statistics", 500);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e761eebe._.js.map