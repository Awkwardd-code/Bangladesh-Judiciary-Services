module.exports = [
"[project]/.next-internal/server/app/api/mentors/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
"[externals]/mongodb [external] (mongodb, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongodb", () => require("mongodb"));

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
    indexesReady = true;
// NOTE: call ensureIndexes() inside getDb()-adjacent helpers or
// at the top of API routes on first DB access. Prefer a single
// call inside each top-level route handler that writes data.
}
}),
"[project]/app/api/mentors/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-response.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/collections.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/indexes.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$indexes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureIndexes"])();
        const collection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$collections$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mentorsCol"])();
        const items = await collection.find({
            isPublished: true
        }).sort({
            order: 1,
            createdAt: 1
        }).toArray();
        const mentors = items.map((mentor)=>{
            const publicMentor = {
                ...mentor
            };
            Reflect.deleteProperty(publicMentor, "photoPublicId");
            return publicMentor;
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            mentors
        });
    } catch (error) {
        console.error("Public mentors list error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Server error", 500);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__57423bb9._.js.map