module.exports = [
"[project]/.next-internal/server/app/api/admin/preliminary-exams/[id]/import/parse/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

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
    return session?.isAdmin === 1 ? session : null;
}
async function requireStudent() {
    const session = await requireSession();
    return session?.role === "student" ? session : null;
}
}),
"[project]/lib/excel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseMCQSheet",
    ()=>parseMCQSheet,
    "parseWrittenSheet",
    ()=>parseWrittenSheet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-route] (ecmascript)");
;
function readSheetRows(buffer) {
    try {
        const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["read"](buffer, {
            type: "buffer"
        });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
        if (!sheet) {
            return {
                rows: [],
                errors: [
                    {
                        rowIndex: 1,
                        message: "The workbook does not contain a sheet."
                    }
                ]
            };
        }
        const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(sheet, {
            defval: "",
            blankrows: true
        });
        return {
            rows,
            errors: []
        };
    } catch (error) {
        return {
            rows: [],
            errors: [
                {
                    rowIndex: 1,
                    message: error instanceof Error ? error.message : "Unable to read workbook."
                }
            ]
        };
    }
}
function normalizeRow(row) {
    return Object.fromEntries(Object.entries(row).map(([key, value])=>[
            key.toLowerCase().trim().replace(/[\s_]+/g, ""),
            value
        ]));
}
function valueText(value) {
    return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}
function getText(row, key) {
    return valueText(row[key]);
}
function getOptionalOrder(row) {
    const rawOrder = getText(row, "order");
    if (!rawOrder) {
        return null;
    }
    const order = Number(rawOrder);
    if (!Number.isInteger(order) || order < 1) {
        throw new Error("Order must be a positive whole number.");
    }
    return order;
}
function parseCorrectOption(value) {
    const answer = valueText(value).toUpperCase();
    const answerMap = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3
    };
    const result = answerMap[answer];
    if (result === undefined) {
        throw new Error("Correct must be A, B, C, D, or a number from 0 to 3.");
    }
    return result;
}
function parseMarks(value) {
    const rawMarks = valueText(value);
    const marks = Number(rawMarks);
    if (!rawMarks || Number.isNaN(marks) || marks < 0) {
        return 1;
    }
    if (marks > 10) {
        throw new Error("Marks cannot exceed 10.");
    }
    if (marks < 0.5) {
        throw new Error("Marks must be at least 0.5.");
    }
    return marks;
}
function parseMCQSheet(buffer) {
    const sheet = readSheetRows(buffer);
    const rows = [];
    const errors = [
        ...sheet.errors
    ];
    sheet.rows.forEach((raw, index)=>{
        const rowIndex = index + 2;
        const normalized = normalizeRow(raw);
        if (Object.values(normalized).every((value)=>!valueText(value))) {
            return;
        }
        try {
            const question = getText(normalized, "question");
            const options = [
                "optiona",
                "optionb",
                "optionc",
                "optiond"
            ].map((key)=>getText(normalized, key));
            if (question.length < 5) {
                throw new Error("Question must contain at least 5 characters.");
            }
            if (question.length > 2000) {
                throw new Error("Question cannot exceed 2000 characters.");
            }
            if (options.some((option)=>option.length === 0 || option.length > 500)) {
                throw new Error("Each option must contain 1 to 500 characters.");
            }
            const subject = getText(normalized, "subject");
            const explanation = getText(normalized, "explanation");
            if (subject.length > 80) {
                throw new Error("Subject cannot exceed 80 characters.");
            }
            if (explanation.length > 2000) {
                throw new Error("Explanation cannot exceed 2000 characters.");
            }
            rows.push({
                rowIndex,
                order: getOptionalOrder(normalized),
                question,
                options,
                correctOptionIndex: parseCorrectOption(normalized.correct),
                marks: parseMarks(normalized.marks),
                subject,
                explanation
            });
        } catch (error) {
            errors.push({
                rowIndex,
                message: error instanceof Error ? error.message : "Invalid MCQ row.",
                raw
            });
        }
    });
    return {
        rows,
        errors
    };
}
function parseWrittenSheet(buffer) {
    const sheet = readSheetRows(buffer);
    const rows = [];
    const errors = [
        ...sheet.errors
    ];
    sheet.rows.forEach((raw, index)=>{
        const rowIndex = index + 2;
        const normalized = normalizeRow(raw);
        if (Object.values(normalized).every((value)=>!valueText(value))) {
            return;
        }
        try {
            const question = getText(normalized, "question");
            const maxMarksText = getText(normalized, "maxmarks");
            const maxMarks = Number(maxMarksText);
            if (question.length < 5) {
                throw new Error("Question must contain at least 5 characters.");
            }
            if (question.length > 5000) {
                throw new Error("Question cannot exceed 5000 characters.");
            }
            if (!maxMarksText || !Number.isFinite(maxMarks) || maxMarks < 1 || maxMarks > 100) {
                throw new Error("Max marks must be a number between 1 and 100.");
            }
            const subject = getText(normalized, "subject");
            if (subject.length > 80) {
                throw new Error("Subject cannot exceed 80 characters.");
            }
            rows.push({
                rowIndex,
                order: getOptionalOrder(normalized),
                question,
                maxMarks,
                subject
            });
        } catch (error) {
            errors.push({
                rowIndex,
                message: error instanceof Error ? error.message : "Invalid written question row.",
                raw
            });
        }
    });
    return {
        rows,
        errors
    };
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
"[project]/app/api/admin/preliminary-exams/[id]/import/parse/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-response.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$excel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/excel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rate-limit.ts [app-route] (ecmascript)");
;
;
;
;
const allowedTypes = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/octet-stream"
]);
const maxFileSize = 5 * 1024 * 1024;
async function POST(req) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAdmin"])();
        if (!session) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Forbidden", 403);
        }
        const ip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIp"])(req);
        const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rateLimit"])({
            key: `excel-parse:${ip}`,
            limit: 10,
            windowMs: 60_000
        });
        if (!limit.allowed) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Too many uploads. Please try again shortly.", 429);
        }
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Choose a spreadsheet file to upload.", 400);
        }
        if (!allowedTypes.has(file.type)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Upload an XLSX, XLS, or CSV file.", 400);
        }
        if (file.size > maxFileSize) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("The spreadsheet must be 5 MB or smaller.", 400);
        }
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$excel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseMCQSheet"])(Buffer.from(await file.arrayBuffer()));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            ...parsed,
            summary: {
                total: parsed.rows.length + parsed.errors.length,
                valid: parsed.rows.length,
                invalid: parsed.errors.length
            }
        });
    } catch (error) {
        console.error("MCQ spreadsheet parse error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$response$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])("Unable to read this spreadsheet.", 400);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5c833e95._.js.map