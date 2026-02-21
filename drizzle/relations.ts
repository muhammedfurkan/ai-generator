import { relations } from "drizzle-orm/relations";
import {
  users,
  activityLogs,
  adminRoles,
  adminUsersExtended,
  aiCharacters,
  aiCharacterImages,
  bannedEmails,
  bannedIps,
  creditTransactions,
  discountCodes,
  discountCodeUsage,
  errorLogs,
  generatedImages,
  favorites,
  feedbacks,
  flaggedPrompts,
  promptBlacklist,
  videoGenerations,
  ipLoginHistory,
  jobQueue,
  multiAngleJobs,
  multiAngleImages,
  notifications,
  paymentRecords,
  creditPackages,
  productPromoVideos,
  promptHistory,
  referrals,
  shopierOrders,
  skinEnhancementJobs,
  stripeOrders,
  ugcAdVideos,
  upscaleHistory,
  userPromptTemplates,
  userSessions,
  userWarnings,
  videoFavorites,
} from "./schema";

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
  adminUsersExtendeds: many(adminUsersExtended),
  aiCharacterImages: many(aiCharacterImages),
  aiCharacters: many(aiCharacters),
  bannedEmails_bannedBy: many(bannedEmails, {
    relationName: "bannedEmails_bannedBy_users_id",
  }),
  bannedEmails_bannedUserId: many(bannedEmails, {
    relationName: "bannedEmails_bannedUserId_users_id",
  }),
  bannedIps_bannedBy: many(bannedIps, {
    relationName: "bannedIps_bannedBy_users_id",
  }),
  bannedIps_bannedUserId: many(bannedIps, {
    relationName: "bannedIps_bannedUserId_users_id",
  }),
  creditTransactions: many(creditTransactions),
  discountCodeUsages: many(discountCodeUsage),
  errorLogs: many(errorLogs),
  favorites: many(favorites),
  feedbacks: many(feedbacks),
  flaggedPrompts_reviewedBy: many(flaggedPrompts, {
    relationName: "flaggedPrompts_reviewedBy_users_id",
  }),
  flaggedPrompts_userId: many(flaggedPrompts, {
    relationName: "flaggedPrompts_userId_users_id",
  }),
  generatedImages: many(generatedImages),
  ipLoginHistories: many(ipLoginHistory),
  jobQueues: many(jobQueue),
  multiAngleJobs: many(multiAngleJobs),
  notifications: many(notifications),
  paymentRecords: many(paymentRecords),
  productPromoVideos: many(productPromoVideos),
  promptBlacklists: many(promptBlacklist),
  promptHistories: many(promptHistory),
  referrals_referredId: many(referrals, {
    relationName: "referrals_referredId_users_id",
  }),
  referrals_referrerId: many(referrals, {
    relationName: "referrals_referrerId_users_id",
  }),
  shopierOrders: many(shopierOrders),
  skinEnhancementJobs: many(skinEnhancementJobs),
  stripeOrders: many(stripeOrders),
  ugcAdVideos: many(ugcAdVideos),
  upscaleHistories: many(upscaleHistory),
  userPromptTemplates: many(userPromptTemplates),
  userSessions: many(userSessions),
  userWarnings_issuedBy: many(userWarnings, {
    relationName: "userWarnings_issuedBy_users_id",
  }),
  userWarnings_userId: many(userWarnings, {
    relationName: "userWarnings_userId_users_id",
  }),
  videoFavorites: many(videoFavorites),
  videoGenerations: many(videoGenerations),
}));

export const adminUsersExtendedRelations = relations(
  adminUsersExtended,
  ({ one }) => ({
    adminRole: one(adminRoles, {
      fields: [adminUsersExtended.roleId],
      references: [adminRoles.id],
    }),
    user: one(users, {
      fields: [adminUsersExtended.userId],
      references: [users.id],
    }),
  })
);

export const adminRolesRelations = relations(adminRoles, ({ many }) => ({
  adminUsersExtendeds: many(adminUsersExtended),
}));

export const aiCharacterImagesRelations = relations(
  aiCharacterImages,
  ({ one }) => ({
    aiCharacter: one(aiCharacters, {
      fields: [aiCharacterImages.characterId],
      references: [aiCharacters.id],
    }),
    user: one(users, {
      fields: [aiCharacterImages.userId],
      references: [users.id],
    }),
  })
);

export const aiCharactersRelations = relations(
  aiCharacters,
  ({ one, many }) => ({
    aiCharacterImages: many(aiCharacterImages),
    user: one(users, {
      fields: [aiCharacters.userId],
      references: [users.id],
    }),
  })
);

export const bannedEmailsRelations = relations(bannedEmails, ({ one }) => ({
  user_bannedBy: one(users, {
    fields: [bannedEmails.bannedBy],
    references: [users.id],
    relationName: "bannedEmails_bannedBy_users_id",
  }),
  user_bannedUserId: one(users, {
    fields: [bannedEmails.bannedUserId],
    references: [users.id],
    relationName: "bannedEmails_bannedUserId_users_id",
  }),
}));

export const bannedIpsRelations = relations(bannedIps, ({ one }) => ({
  user_bannedBy: one(users, {
    fields: [bannedIps.bannedBy],
    references: [users.id],
    relationName: "bannedIps_bannedBy_users_id",
  }),
  user_bannedUserId: one(users, {
    fields: [bannedIps.bannedUserId],
    references: [users.id],
    relationName: "bannedIps_bannedUserId_users_id",
  }),
}));

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.id],
    }),
  })
);

export const discountCodeUsageRelations = relations(
  discountCodeUsage,
  ({ one }) => ({
    discountCode: one(discountCodes, {
      fields: [discountCodeUsage.discountCodeId],
      references: [discountCodes.id],
    }),
    user: one(users, {
      fields: [discountCodeUsage.userId],
      references: [users.id],
    }),
  })
);

export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  discountCodeUsages: many(discountCodeUsage),
  paymentRecords: many(paymentRecords),
}));

export const errorLogsRelations = relations(errorLogs, ({ one }) => ({
  user: one(users, {
    fields: [errorLogs.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  generatedImage: one(generatedImages, {
    fields: [favorites.imageId],
    references: [generatedImages.id],
  }),
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

export const generatedImagesRelations = relations(
  generatedImages,
  ({ one, many }) => ({
    favorites: many(favorites),
    flaggedPrompts: many(flaggedPrompts),
    user: one(users, {
      fields: [generatedImages.userId],
      references: [users.id],
    }),
  })
);

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
}));

export const flaggedPromptsRelations = relations(
  flaggedPrompts,
  ({ one, many }) => ({
    generatedImage: one(generatedImages, {
      fields: [flaggedPrompts.imageId],
      references: [generatedImages.id],
    }),
    promptBlacklist: one(promptBlacklist, {
      fields: [flaggedPrompts.matchedPatternId],
      references: [promptBlacklist.id],
    }),
    user_reviewedBy: one(users, {
      fields: [flaggedPrompts.reviewedBy],
      references: [users.id],
      relationName: "flaggedPrompts_reviewedBy_users_id",
    }),
    user_userId: one(users, {
      fields: [flaggedPrompts.userId],
      references: [users.id],
      relationName: "flaggedPrompts_userId_users_id",
    }),
    videoGeneration: one(videoGenerations, {
      fields: [flaggedPrompts.videoId],
      references: [videoGenerations.id],
    }),
    userWarnings: many(userWarnings),
  })
);

export const promptBlacklistRelations = relations(
  promptBlacklist,
  ({ one, many }) => ({
    flaggedPrompts: many(flaggedPrompts),
    user: one(users, {
      fields: [promptBlacklist.createdBy],
      references: [users.id],
    }),
  })
);

export const videoGenerationsRelations = relations(
  videoGenerations,
  ({ one, many }) => ({
    flaggedPrompts: many(flaggedPrompts),
    videoFavorites: many(videoFavorites),
    user: one(users, {
      fields: [videoGenerations.userId],
      references: [users.id],
    }),
  })
);

export const ipLoginHistoryRelations = relations(ipLoginHistory, ({ one }) => ({
  user: one(users, {
    fields: [ipLoginHistory.userId],
    references: [users.id],
  }),
}));

export const jobQueueRelations = relations(jobQueue, ({ one }) => ({
  user: one(users, {
    fields: [jobQueue.userId],
    references: [users.id],
  }),
}));

export const multiAngleImagesRelations = relations(
  multiAngleImages,
  ({ one }) => ({
    multiAngleJob: one(multiAngleJobs, {
      fields: [multiAngleImages.jobId],
      references: [multiAngleJobs.id],
    }),
  })
);

export const multiAngleJobsRelations = relations(
  multiAngleJobs,
  ({ one, many }) => ({
    multiAngleImages: many(multiAngleImages),
    user: one(users, {
      fields: [multiAngleJobs.userId],
      references: [users.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  discountCode: one(discountCodes, {
    fields: [paymentRecords.discountCodeId],
    references: [discountCodes.id],
  }),
  creditPackage: one(creditPackages, {
    fields: [paymentRecords.packageId],
    references: [creditPackages.id],
  }),
  user: one(users, {
    fields: [paymentRecords.userId],
    references: [users.id],
  }),
}));

export const creditPackagesRelations = relations(
  creditPackages,
  ({ many }) => ({
    paymentRecords: many(paymentRecords),
    shopierOrders: many(shopierOrders),
    stripeOrders: many(stripeOrders),
  })
);

export const productPromoVideosRelations = relations(
  productPromoVideos,
  ({ one }) => ({
    user: one(users, {
      fields: [productPromoVideos.userId],
      references: [users.id],
    }),
  })
);

export const promptHistoryRelations = relations(promptHistory, ({ one }) => ({
  user: one(users, {
    fields: [promptHistory.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  user_referredId: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referrals_referredId_users_id",
  }),
  user_referrerId: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrals_referrerId_users_id",
  }),
}));

export const shopierOrdersRelations = relations(shopierOrders, ({ one }) => ({
  creditPackage: one(creditPackages, {
    fields: [shopierOrders.packageId],
    references: [creditPackages.id],
  }),
  user: one(users, {
    fields: [shopierOrders.userId],
    references: [users.id],
  }),
}));

export const skinEnhancementJobsRelations = relations(
  skinEnhancementJobs,
  ({ one }) => ({
    user: one(users, {
      fields: [skinEnhancementJobs.userId],
      references: [users.id],
    }),
  })
);

export const stripeOrdersRelations = relations(stripeOrders, ({ one }) => ({
  creditPackage: one(creditPackages, {
    fields: [stripeOrders.packageId],
    references: [creditPackages.id],
  }),
  user: one(users, {
    fields: [stripeOrders.userId],
    references: [users.id],
  }),
}));

export const ugcAdVideosRelations = relations(ugcAdVideos, ({ one }) => ({
  user: one(users, {
    fields: [ugcAdVideos.userId],
    references: [users.id],
  }),
}));

export const upscaleHistoryRelations = relations(upscaleHistory, ({ one }) => ({
  user: one(users, {
    fields: [upscaleHistory.userId],
    references: [users.id],
  }),
}));

export const userPromptTemplatesRelations = relations(
  userPromptTemplates,
  ({ one }) => ({
    user: one(users, {
      fields: [userPromptTemplates.userId],
      references: [users.id],
    }),
  })
);

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userWarningsRelations = relations(userWarnings, ({ one }) => ({
  user_issuedBy: one(users, {
    fields: [userWarnings.issuedBy],
    references: [users.id],
    relationName: "userWarnings_issuedBy_users_id",
  }),
  flaggedPrompt: one(flaggedPrompts, {
    fields: [userWarnings.relatedPromptId],
    references: [flaggedPrompts.id],
  }),
  user_userId: one(users, {
    fields: [userWarnings.userId],
    references: [users.id],
    relationName: "userWarnings_userId_users_id",
  }),
}));

export const videoFavoritesRelations = relations(videoFavorites, ({ one }) => ({
  user: one(users, {
    fields: [videoFavorites.userId],
    references: [users.id],
  }),
  videoGeneration: one(videoGenerations, {
    fields: [videoFavorites.videoId],
    references: [videoGenerations.id],
  }),
}));
