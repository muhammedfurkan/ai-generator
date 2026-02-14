import {
	mysqlTable,
	mysqlSchema,
	AnyMySqlColumn,
	foreignKey,
	primaryKey,
	int,
	tinyint,
	varchar,
	text,
	timestamp,
	unique,
	mysqlEnum,
	decimal,
	index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm"

export const activityLogs = mysqlTable("activityLogs", {
	id: int().autoincrement().notNull(),
	userId: int().references(() => users.id, { onDelete: "cascade" }),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar({ length: 50 }),
	entityId: int(),
	oldValue: text(),
	newValue: text(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "activityLogs_id" }),
	]);

export const adminRoles = mysqlTable("adminRoles", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 50 }).notNull(),
	displayName: varchar({ length: 100 }).notNull(),
	description: text(),
	permissions: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "adminRoles_id" }),
		unique("adminRoles_name_unique").on(table.name),
	]);

export const adminUsersExtended = mysqlTable("adminUsersExtended", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	roleId: int().references(() => adminRoles.id),
	twoFactorEnabled: tinyint().default(0).notNull(),
	twoFactorSecret: varchar({ length: 255 }),
	ipWhitelist: text(),
	lastLoginAt: timestamp({ mode: 'string' }),
	lastLoginIp: varchar({ length: 45 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "adminUsersExtended_id" }),
		unique("adminUsersExtended_userId_unique").on(table.userId),
	]);

export const aiCharacterImages = mysqlTable("aiCharacterImages", {
	id: int().autoincrement().notNull(),
	characterId: int().notNull().references(() => aiCharacters.id, { onDelete: "cascade" }),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	prompt: text().notNull(),
	referenceImageUrl: text(),
	generatedImageUrl: text().notNull(),
	aspectRatio: varchar({ length: 10 }).notNull(),
	resolution: varchar({ length: 10 }).notNull(),
	creditsCost: int().default(10).notNull(),
	taskId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "aiCharacterImages_id" }),
	]);

export const aiCharacters = mysqlTable("aiCharacters", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	name: varchar({ length: 255 }).notNull(),
	characterImageUrl: text().notNull(),
	description: text(),
	gender: varchar({ length: 20 }),
	style: varchar({ length: 100 }),
	usageCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	isPublic: tinyint().default(0).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "aiCharacters_id" }),
	]);

export const aiModelConfig = mysqlTable("aiModelConfig", {
	id: int().autoincrement().notNull(),
	modelKey: varchar({ length: 100 }).notNull(),
	modelName: varchar({ length: 200 }).notNull(),
	modelType: mysqlEnum(['image', 'video', 'upscale']).notNull(),
	provider: varchar({ length: 100 }).notNull(),
	isActive: tinyint().default(1).notNull(),
	isMaintenanceMode: tinyint().default(0).notNull(),
	maxResolutionWidth: int().default(4096),
	maxResolutionHeight: int().default(4096),
	maxVideoDurationSeconds: int(),
	freeUserDailyLimit: int().default(5),
	premiumUserDailyLimit: int().default(50),
	creditCostOverride: int(),
	fallbackModelId: int(),
	totalRequests: int().default(0).notNull(),
	successfulRequests: int().default(0).notNull(),
	failedRequests: int().default(0).notNull(),
	avgRenderTimeMs: int().default(0),
	costPerRequest: decimal({ precision: 10, scale: 6 }).default('0.000000'),
	totalCostUsd: decimal({ precision: 10, scale: 2 }).default('0.00'),
	priority: int().default(0).notNull(),
	description: text(),
	configJson: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	coverImageDesktop: text(),
	coverImageMobile: text(),
	coverDescription: text(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "aiModelConfig_id" }),
		unique("aiModelConfig_modelKey_unique").on(table.modelKey),
	]);

export const announcements = mysqlTable("announcements", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	type: mysqlEnum(['popup', 'banner', 'notification', 'maintenance']).notNull(),
	targetAudience: mysqlEnum(['all', 'logged_in', 'logged_out', 'new_users']).default('all').notNull(),
	buttonText: varchar({ length: 100 }),
	buttonUrl: varchar({ length: 500 }),
	imageUrl: text(),
	backgroundColor: varchar({ length: 20 }),
	textColor: varchar({ length: 20 }),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	dismissible: tinyint().default(1).notNull(),
	showOnce: tinyint().default(0).notNull(),
	priority: int().default(0).notNull(),
	viewCount: int().default(0).notNull(),
	clickCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "announcements_id" }),
	]);

export const apiUsageStats = mysqlTable("apiUsageStats", {
	id: int().autoincrement().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	apiName: varchar({ length: 100 }).notNull(),
	endpoint: varchar({ length: 200 }),
	requestCount: int().default(0).notNull(),
	successCount: int().default(0).notNull(),
	errorCount: int().default(0).notNull(),
	totalLatencyMs: int().default(0).notNull(),
	totalCost: decimal({ precision: 10, scale: 4 }).default('0.0000').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "apiUsageStats_id" }),
	]);

export const bannedEmails = mysqlTable("bannedEmails", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	isPattern: tinyint().default(0).notNull(),
	reason: text(),
	bannedBy: int().references(() => users.id),
	bannedUserId: int().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "bannedEmails_id" }),
		unique("bannedEmails_email_unique").on(table.email),
	]);

export const bannedIps = mysqlTable("bannedIps", {
	id: int().autoincrement().notNull(),
	ipAddress: varchar({ length: 45 }).notNull(),
	reason: text(),
	bannedBy: int().references(() => users.id),
	bannedUserId: int().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "bannedIps_id" }),
		unique("bannedIps_ipAddress_unique").on(table.ipAddress),
	]);

export const blogPosts = mysqlTable("blogPosts", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	content: text().notNull(),
	coverImage: text(),
	category: varchar({ length: 50 }).notNull(),
	author: varchar({ length: 100 }).default('Nano Influencer').notNull(),
	readTime: varchar({ length: 20 }).default('5 dk').notNull(),
	status: mysqlEnum(['draft', 'published', 'archived']).default('draft').notNull(),
	viewCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	publishedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "blogPosts_id" }),
		unique("blogPosts_slug_unique").on(table.slug),
	]);

export const creditPackages = mysqlTable("creditPackages", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	credits: int().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	originalPrice: decimal({ precision: 10, scale: 2 }),
	badge: varchar({ length: 50 }),
	features: text(),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	isHighlighted: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	usage1K: int(),
	usage2K: int(),
	usage4K: int(),
	shopierUrl: text(),
	bonus: int(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "creditPackages_id" }),
	]);

export const creditTransactions = mysqlTable("creditTransactions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	type: mysqlEnum(['add', 'deduct', 'purchase']).notNull(),
	amount: int().notNull(),
	reason: text(),
	balanceBefore: int().notNull(),
	balanceAfter: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "creditTransactions_id" }),
	]);

export const discountCodeUsage = mysqlTable("discountCodeUsage", {
	id: int().autoincrement().notNull(),
	discountCodeId: int().notNull().references(() => discountCodes.id, { onDelete: "cascade" }),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	orderId: int(),
	discountAmount: decimal({ precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "discountCodeUsage_id" }),
	]);

export const discountCodes = mysqlTable("discountCodes", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: text(),
	discountType: mysqlEnum(['percentage', 'fixed', 'credits']).notNull(),
	discountValue: decimal({ precision: 10, scale: 2 }).notNull(),
	minPurchase: decimal({ precision: 10, scale: 2 }),
	maxUses: int(),
	usedCount: int().default(0).notNull(),
	maxUsesPerUser: int().default(1).notNull(),
	validFrom: timestamp({ mode: 'string' }),
	validUntil: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "discountCodes_id" }),
		unique("discountCodes_code_unique").on(table.code),
	]);

export const errorLogs = mysqlTable("errorLogs", {
	id: int().autoincrement().notNull(),
	userId: int().references(() => users.id, { onDelete: "cascade" }),
	errorType: varchar({ length: 50 }).notNull(),
	errorCode: varchar({ length: 50 }),
	errorMessage: text().notNull(),
	endpoint: varchar({ length: 255 }),
	requestData: text(),
	stackTrace: text(),
	userAgent: varchar({ length: 500 }),
	ipAddress: varchar({ length: 45 }),
	resolved: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "errorLogs_id" }),
	]);

export const faqs = mysqlTable("faqs", {
	id: int().autoincrement().notNull(),
	question: varchar({ length: 500 }).notNull(),
	answer: text().notNull(),
	category: varchar({ length: 100 }),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	viewCount: int().default(0).notNull(),
	helpfulCount: int().default(0).notNull(),
	notHelpfulCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "faqs_id" }),
	]);

export const favorites = mysqlTable("favorites", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	imageId: int().notNull().references(() => generatedImages.id, { onDelete: "cascade" }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "favorites_id" }),
	]);

export const featurePricing = mysqlTable("featurePricing", {
	id: int().autoincrement().notNull(),
	featureKey: varchar({ length: 100 }).notNull(),
	featureName: varchar({ length: 200 }).notNull(),
	category: mysqlEnum(['image', 'video', 'upscale', 'ai_character', 'viral_app', 'multi_angle', 'product_promo', 'ugc_ad']).notNull(),
	credits: int().notNull(),
	description: text(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "featurePricing_id" }),
		unique("featurePricing_featureKey_unique").on(table.featureKey),
	]);

export const feedbacks = mysqlTable("feedbacks", {
	id: int().autoincrement().notNull(),
	userId: int().references(() => users.id, { onDelete: "cascade" }),
	type: mysqlEnum(['bug', 'suggestion', 'complaint', 'other']).notNull(),
	description: text().notNull(),
	screenshotUrl: text(),
	status: mysqlEnum(['new', 'in_progress', 'resolved', 'closed']).default('new').notNull(),
	adminNotes: text(),
	userAgent: text(),
	pageUrl: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "feedbacks_id" }),
	]);

export const flaggedPrompts = mysqlTable("flaggedPrompts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	prompt: text().notNull(),
	flagReason: mysqlEnum(['nsfw', 'spam', 'abuse', 'illegal', 'copyright', 'user_report', 'auto_detected']).notNull(),
	matchedPatternId: int().references(() => promptBlacklist.id),
	status: mysqlEnum(['pending', 'approved', 'rejected', 'banned']).default('pending').notNull(),
	reviewedBy: int().references(() => users.id),
	reviewNotes: text(),
	reviewedAt: timestamp({ mode: 'string' }),
	imageId: int().references(() => generatedImages.id),
	videoId: int().references(() => videoGenerations.id),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "flaggedPrompts_id" }),
	]);

export const generatedImages = mysqlTable("generatedImages", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	prompt: text().notNull(),
	referenceImageUrl: text(),
	generatedImageUrl: text(),
	aspectRatio: varchar({ length: 10 }).notNull(),
	resolution: varchar({ length: 10 }).notNull(),
	creditsCost: int().default(10).notNull(),
	taskId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	errorMessage: text(),
	completedAt: timestamp({ mode: 'string' }),
	aiModel: varchar({ length: 50 }).default('qwen').notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "generatedImages_id" }),
	]);

export const globalSeoConfig = mysqlTable("globalSeoConfig", {
	id: int().autoincrement().notNull(),
	siteName: varchar({ length: 100 }).default('NanoInf'),
	siteTagline: varchar({ length: 200 }),
	defaultLanguage: varchar({ length: 10 }).default('tr'),
	defaultMetaTitle: varchar({ length: 70 }),
	defaultMetaDescription: varchar({ length: 160 }),
	defaultMetaKeywords: text(),
	defaultOgImage: text(),
	facebookAppId: varchar({ length: 50 }),
	defaultTwitterSite: varchar({ length: 50 }),
	defaultTwitterCreator: varchar({ length: 50 }),
	googleVerification: varchar({ length: 100 }),
	bingVerification: varchar({ length: 100 }),
	yandexVerification: varchar({ length: 100 }),
	pinterestVerification: varchar({ length: 100 }),
	googleAnalyticsId: varchar({ length: 50 }),
	googleTagManagerId: varchar({ length: 50 }),
	facebookPixelId: varchar({ length: 50 }),
	robotsTxtContent: text(),
	sitemapEnabled: tinyint().default(1).notNull(),
	sitemapLastGenerated: timestamp({ mode: 'string' }),
	organizationName: varchar({ length: 200 }),
	organizationLogo: text(),
	organizationUrl: varchar({ length: 500 }),
	contactEmail: varchar({ length: 200 }),
	contactPhone: varchar({ length: 50 }),
	socialLinks: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "globalSeoConfig_id" }),
	]);

export const homepageSections = mysqlTable("homepageSections", {
	id: int().autoincrement().notNull(),
	sectionKey: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 100 }).notNull(),
	isVisible: tinyint().default(1).notNull(),
	order: int().default(0).notNull(),
	config: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "homepageSections_id" }),
		unique("homepageSections_sectionKey_unique").on(table.sectionKey),
	]);

export const ipLoginHistory = mysqlTable("ipLoginHistory", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	ipAddress: varchar({ length: 45 }).notNull(),
	userAgent: text(),
	country: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	region: varchar({ length: 100 }),
	deviceType: mysqlEnum(['desktop', 'mobile', 'tablet', 'unknown']).default('unknown'),
	browser: varchar({ length: 100 }),
	os: varchar({ length: 100 }),
	loginType: mysqlEnum(['login', 'register', 'api_access']).default('login').notNull(),
	isSuccessful: tinyint().default(1).notNull(),
	failReason: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "ipLoginHistory_id" }),
	]);

export const jobQueue = mysqlTable("jobQueue", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	jobType: mysqlEnum(['image', 'video', 'upscale', 'multi_angle', 'skin_enhancement', 'product_promo', 'ugc_ad']).notNull(),
	relatedId: int(),
	priority: int().default(0).notNull(),
	status: mysqlEnum(['queued', 'processing', 'completed', 'failed', 'cancelled']).default('queued').notNull(),
	queuedAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	workerId: varchar({ length: 100 }),
	attempts: int().default(0).notNull(),
	maxAttempts: int().default(3).notNull(),
	lastError: text(),
	estimatedDurationMs: int(),
	actualDurationMs: int(),
	modelKey: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "jobQueue_id" }),
	]);

export const modalCards = mysqlTable("modalCards", {
	id: int().autoincrement().notNull(),
	cardKey: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: varchar({ length: 500 }),
	imageDesktop: text(),
	imageMobile: text(),
	badge: varchar({ length: 50 }),
	badgeColor: varchar({ length: 50 }),
	path: varchar({ length: 255 }),
	category: mysqlEnum(['images', 'videos', 'tools']).notNull(),
	isFeatured: tinyint().default(0).notNull(),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "modalCards_id" }),
		unique("modalCards_cardKey_unique").on(table.cardKey),
	]);

export const multiAngleImages = mysqlTable("multiAngleImages", {
	id: int().autoincrement().notNull(),
	jobId: int().notNull().references(() => multiAngleJobs.id, { onDelete: "cascade" }),
	angleIndex: int().notNull(),
	angleName: varchar({ length: 100 }).notNull(),
	prompt: text().notNull(),
	generatedImageUrl: text(),
	taskId: varchar({ length: 255 }),
	status: mysqlEnum(['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "multiAngleImages_id" }),
	]);

export const multiAngleJobs = mysqlTable("multiAngleJobs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	referenceImageUrl: text().notNull(),
	angleSet: mysqlEnum(['temel_4', 'standart_6', 'profesyonel_8']).notNull(),
	totalImages: int().notNull(),
	completedImages: int().default(0).notNull(),
	creditsCost: int().notNull(),
	status: mysqlEnum(['pending', 'processing', 'completed', 'failed', 'partial']).default('pending').notNull(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "multiAngleJobs_id" }),
	]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	type: mysqlEnum(['generation_complete', 'low_credits', 'welcome', 'referral_bonus', 'system', 'credit_added']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	data: text(),
	isRead: tinyint().default(0).notNull(),
	actionUrl: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "notifications_id" }),
	]);

export const paymentRecords = mysqlTable("paymentRecords", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	packageId: int().references(() => creditPackages.id),
	packageName: varchar({ length: 100 }),
	credits: int().notNull(),
	amount: decimal({ precision: 10, scale: 2 }).notNull(),
	amountUsd: decimal({ precision: 10, scale: 2 }),
	currency: varchar({ length: 3 }).default('TRY').notNull(),
	paymentMethod: mysqlEnum(['credit_card', 'debit_card', 'crypto', 'bank_transfer', 'paypal', 'other']).notNull(),
	paymentProvider: varchar({ length: 50 }),
	externalTransactionId: varchar({ length: 255 }),
	externalOrderId: varchar({ length: 255 }),
	status: mysqlEnum(['pending', 'completed', 'failed', 'refunded', 'cancelled', 'disputed']).default('pending').notNull(),
	discountCodeId: int().references(() => discountCodes.id),
	discountAmount: decimal({ precision: 10, scale: 2 }),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	cardLastFour: varchar({ length: 4 }),
	cardBrand: varchar({ length: 20 }),
	binNumber: varchar({ length: 6 }),
	metadata: text(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "paymentRecords_id" }),
	]);

export const productPromoVideos = mysqlTable("productPromoVideos", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	productImageUrl: text().notNull(),
	stylePreset: mysqlEnum(['minimal_clean', 'premium_luxury', 'tech_futuristic', 'social_viral']).notNull(),
	productName: varchar({ length: 200 }),
	slogan: varchar({ length: 300 }),
	generatedVideoUrl: text(),
	thumbnailUrl: text(),
	taskId: varchar({ length: 255 }),
	prompt: text().notNull(),
	creditsCost: int().default(30).notNull(),
	status: mysqlEnum(['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
	errorMessage: text(),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "productPromoVideos_id" }),
	]);

export const promptBlacklist = mysqlTable("promptBlacklist", {
	id: int().autoincrement().notNull(),
	pattern: varchar({ length: 500 }).notNull(),
	patternType: mysqlEnum(['exact', 'contains', 'regex', 'starts_with', 'ends_with']).default('contains').notNull(),
	category: mysqlEnum(['nsfw', 'spam', 'abuse', 'illegal', 'copyright', 'other']).notNull(),
	severity: mysqlEnum(['low', 'medium', 'high', 'critical']).default('medium').notNull(),
	actionType: mysqlEnum(['block', 'warn', 'flag_for_review', 'auto_ban']).default('block').notNull(),
	warningMessage: text(),
	isActive: tinyint().default(1).notNull(),
	hitCount: int().default(0).notNull(),
	createdBy: int().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "promptBlacklist_id" }),
	]);

export const promptHistory = mysqlTable("promptHistory", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	prompt: text().notNull(),
	aspectRatio: varchar({ length: 10 }).notNull(),
	resolution: varchar({ length: 10 }).notNull(),
	usageCount: int().default(1).notNull(),
	lastUsedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "promptHistory_id" }),
	]);

export const referrals = mysqlTable("referrals", {
	id: int().autoincrement().notNull(),
	referrerId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	referredId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	referralCode: varchar({ length: 20 }).notNull(),
	referrerBonusGiven: tinyint().default(0).notNull(),
	referredBonusGiven: tinyint().default(0).notNull(),
	referrerBonusAmount: int().default(50).notNull(),
	referredBonusAmount: int().default(20).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "referrals_id" }),
	]);

export const seoSettings = mysqlTable("seoSettings", {
	id: int().autoincrement().notNull(),
	pageSlug: varchar({ length: 100 }).notNull(),
	pageName: varchar({ length: 200 }).notNull(),
	metaTitle: varchar({ length: 70 }),
	metaDescription: varchar({ length: 160 }),
	metaKeywords: text(),
	canonicalUrl: varchar({ length: 500 }),
	ogTitle: varchar({ length: 95 }),
	ogDescription: varchar({ length: 200 }),
	ogImage: text(),
	ogType: mysqlEnum(['website', 'article', 'product', 'profile']).default('website'),
	ogLocale: varchar({ length: 10 }).default('tr_TR'),
	twitterCard: mysqlEnum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
	twitterTitle: varchar({ length: 70 }),
	twitterDescription: varchar({ length: 200 }),
	twitterImage: text(),
	twitterSite: varchar({ length: 50 }),
	twitterCreator: varchar({ length: 50 }),
	robotsIndex: tinyint().default(1).notNull(),
	robotsFollow: tinyint().default(1).notNull(),
	robotsNoArchive: tinyint().default(0).notNull(),
	robotsNoSnippet: tinyint().default(0).notNull(),
	structuredData: text(),
	priority: decimal({ precision: 2, scale: 1 }).default('0.5'),
	changeFrequency: mysqlEnum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).default('weekly'),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastMod: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "seoSettings_id" }),
		unique("seoSettings_pageSlug_unique").on(table.pageSlug),
	]);

export const shopierOrders = mysqlTable("shopierOrders", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	packageId: int().references(() => creditPackages.id, { onDelete: "set null" }),
	creditsAmount: int().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('TRY').notNull(),
	merchantOrderId: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(['pending', 'success', 'failed']).default('pending').notNull(),
	shopierOrderId: varchar({ length: 100 }),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "shopierOrders_id" }),
		unique("shopierOrders_merchantOrderId_unique").on(table.merchantOrderId),
	]);

export const siteSettings = mysqlTable("siteSettings", {
	id: int().autoincrement().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text(),
	category: mysqlEnum(['general', 'seo', 'contact', 'social', 'email', 'notification', 'security', 'maintenance']).notNull(),
	label: varchar({ length: 200 }).notNull(),
	description: text(),
	inputType: mysqlEnum(['text', 'textarea', 'number', 'boolean', 'url', 'email', 'json', 'image']).default('text').notNull(),
	isPublic: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "siteSettings_id" }),
		unique("siteSettings_key_unique").on(table.key),
	]);

export const skinEnhancementJobs = mysqlTable("skinEnhancementJobs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	originalImageUrl: text().notNull(),
	enhancedImageUrl: text(),
	mode: mysqlEnum(['natural_clean', 'soft_glow', 'studio_look', 'no_makeup_real']).notNull(),
	proMode: tinyint().default(0).notNull(),
	status: mysqlEnum(['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
	creditCost: int().notNull(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "skinEnhancementJobs_id" }),
	]);

export const stripeOrders = mysqlTable("stripeOrders", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	packageId: int().references(() => creditPackages.id, { onDelete: "set null" }),
	creditsAmount: int().notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('TRY').notNull(),
	stripeSessionId: varchar({ length: 255 }),
	stripePaymentIntentId: varchar({ length: 255 }),
	stripeCustomerId: varchar({ length: 255 }),
	status: mysqlEnum(['pending', 'processing', 'success', 'failed', 'refunded']).default('pending').notNull(),
	errorMessage: text(),
	metadata: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "stripeOrders_id" }),
		unique("stripeOrders_stripeSessionId_unique").on(table.stripeSessionId),
	]);

export const systemRateLimits = mysqlTable("systemRateLimits", {
	id: int().autoincrement().notNull(),
	limitKey: varchar({ length: 100 }).notNull(),
	limitName: varchar({ length: 200 }).notNull(),
	requestsPerWindow: int().notNull(),
	windowSizeSeconds: int().notNull(),
	freeUserMultiplier: decimal({ precision: 3, scale: 2 }).default('1.00'),
	premiumUserMultiplier: decimal({ precision: 3, scale: 2 }).default('2.00'),
	blockDurationSeconds: int().default(60),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp({ mode: 'string' }).default(sql`(now())`).onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "systemRateLimits_id" }),
		unique("systemRateLimits_limitKey_unique").on(table.limitKey),
	]);

export const systemSettings = mysqlTable("systemSettings", {
	id: int().autoincrement().notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	description: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "systemSettings_id" }),
		unique("systemSettings_key_unique").on(table.key),
	]);

export const ugcAdVideos = mysqlTable("ugcAdVideos", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	productImageUrl: text(),
	productVideoUrl: text(),
	videoModel: mysqlEnum(['veo31']).notNull(),
	ugcScenario: mysqlEnum(['testimonial', 'unboxing', 'problem_solution', 'first_impression', 'lifestyle']).notNull(),
	characterGender: mysqlEnum(['male', 'female']).notNull(),
	language: varchar({ length: 50 }).default('tr').notNull(),
	tone: mysqlEnum(['casual', 'excited', 'calm', 'persuasive']).notNull(),
	productName: varchar({ length: 200 }),
	keyBenefit: varchar({ length: 500 }),
	generatedVideoUrl: text(),
	thumbnailUrl: text(),
	taskId: varchar({ length: 255 }),
	prompt: text().notNull(),
	creditsCost: int().default(45).notNull(),
	status: mysqlEnum(['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
	errorMessage: text(),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "ugcAdVideos_id" }),
	]);

export const upscaleHistory = mysqlTable("upscaleHistory", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	originalImageUrl: text().notNull(),
	upscaledImageUrl: text(),
	upscaleFactor: varchar({ length: 5 }).notNull(),
	creditsCost: int().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	taskId: varchar({ length: 255 }),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "upscaleHistory_id" }),
	]);

export const userPromptTemplates = mysqlTable("userPromptTemplates", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	prompt: text().notNull(),
	category: varchar({ length: 100 }),
	aspectRatio: varchar({ length: 10 }).notNull(),
	resolution: varchar({ length: 10 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "userPromptTemplates_id" }),
	]);

export const userSessions = mysqlTable("userSessions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	sessionToken: varchar({ length: 255 }).notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	deviceType: mysqlEnum(['desktop', 'mobile', 'tablet', 'unknown']).default('unknown').notNull(),
	browser: varchar({ length: 100 }),
	os: varchar({ length: 100 }),
	country: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	lastActivityAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "userSessions_id" }),
		unique("userSessions_sessionToken_unique").on(table.sessionToken),
	]);

export const userWarnings = mysqlTable("userWarnings", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	warningType: mysqlEnum(['nsfw_content', 'spam', 'abuse', 'tos_violation', 'payment_issue', 'other']).notNull(),
	severity: mysqlEnum(['notice', 'warning', 'final_warning']).default('warning').notNull(),
	reason: text().notNull(),
	relatedPromptId: int().references(() => flaggedPrompts.id),
	issuedBy: int().references(() => users.id),
	acknowledged: tinyint().default(0).notNull(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	autoActionTaken: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`).notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "userWarnings_id" }),
	]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user', 'admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).defaultNow().notNull(),
	credits: int().default(100).notNull(),
	referralCode: varchar({ length: 20 }),
	referredBy: int(),
	clerkId: varchar({ length: 64 }),
	passwordHash: varchar({ length: 255 }),
	emailVerified: tinyint().default(0).notNull(),
	emailVerificationToken: varchar({ length: 255 }),
	emailVerificationClerkId: varchar({ length: 64 }),
	isBanned: tinyint().default(0).notNull(),
	bannedAt: timestamp({ mode: 'string' }),
	banReason: text(),
	bannedBy: int(),
	lastKnownIp: varchar({ length: 45 }),
	emailVerificationCode: varchar({ length: 6 }),
	emailVerificationCodeExpiry: timestamp({ mode: 'string' }),
},
	(table) => [
		index("users_referredBy_users_id_fk").on(table.referredBy),
		primaryKey({ columns: [table.id], name: "users_id" }),
		unique("users_clerkId_unique").on(table.clerkId),
		unique("users_email_unique").on(table.email),
		unique("users_openId_unique").on(table.openId),
		unique("users_referralCode_unique").on(table.referralCode),
	]);

export const videoFavorites = mysqlTable("videoFavorites", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	videoId: int().notNull().references(() => videoGenerations.id, { onDelete: "cascade" }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "videoFavorites_id" }),
	]);

export const videoGenerations = mysqlTable("videoGenerations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	prompt: text().notNull(),
	referenceImageUrl: text(),
	videoUrl: text(),
	thumbnailUrl: text(),
	model: varchar({ length: 50 }).notNull(),
	mode: varchar({ length: 20 }).notNull(),
	duration: int().notNull(),
	quality: varchar({ length: 20 }),
	hasAudio: tinyint().default(0).notNull(),
	creditsCost: int().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	taskId: varchar({ length: 255 }),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "videoGenerations_id" }),
	]);

export const viralAppsConfig = mysqlTable("viralAppsConfig", {
	id: int().autoincrement().notNull(),
	appKey: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	emoji: varchar({ length: 10 }),
	coverImage: text(),
	promptTemplate: text().notNull(),
	credits: int().notNull(),
	category: varchar({ length: 100 }),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	isPopular: tinyint().default(0).notNull(),
	usageCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "viralAppsConfig_id" }),
		unique("viralAppsConfig_appKey_unique").on(table.appKey),
	]);
