import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  userSettings: defineTable({
    userId: v.id("users"),
    userType: v.union(v.literal("provider"), v.literal("facility")),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_userType", ["userType"]),

  providerProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    postalCode: v.string(),
    phone: v.optional(v.string()),
    maxTravelDistance: v.number(),
    ageGroups: v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    )),
    sharePhone: v.boolean(),
    shareEmail: v.boolean(),
  }).index("by_userId", ["userId"])
    .index("by_postalCode", ["postalCode"]),

  facilityProfiles: defineTable({
    userId: v.id("users"),
    facilityName: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    postalCode: v.string(),
    phone: v.string(),
    contactPersonName: v.string(),
    facilityImages: v.optional(v.array(v.id("_storage"))),
  }).index("by_userId", ["userId"])
    .index("by_postalCode", ["postalCode"]),

  availabilities: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("recurring"), v.literal("oneTime")),
    dayOfWeek: v.optional(v.number()),
    startTime: v.string(),
    endTime: v.string(),
    date: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_date", ["date"]),

  jobPostings: defineTable({
    facilityId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("substitute"), v.literal("longterm")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.number())),
    startTime: v.string(),
    endTime: v.string(),
    ageGroups: v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    )),
    maxPositions: v.number(),
    currentMatches: v.number(),
    status: v.union(
      v.literal("open"), 
      v.literal("inProgress"), 
      v.literal("completed"), 
      v.literal("expired")
    ),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_facilityId", ["facilityId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_startDate", ["startDate"]),

  applications: defineTable({
    jobPostingId: v.id("jobPostings"),
    providerId: v.id("users"),
    message: v.optional(v.string()),
    status: v.union(
      v.literal("pending"), 
      v.literal("accepted"), 
      v.literal("rejected")
    ),
    appliedAt: v.number(),
    respondedAt: v.optional(v.number()),
    deleteAt: v.optional(v.number()),
  }).index("by_jobPosting", ["jobPostingId"])
    .index("by_provider", ["providerId"])
    .index("by_status", ["status"]),

  chats: defineTable({
    providerId: v.id("users"),
    facilityId: v.id("users"),
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    originApplicationId: v.optional(v.id("applications")),
  }).index("by_provider", ["providerId"])
    .index("by_facility", ["facilityId"])
    .index("by_participants", ["providerId", "facilityId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
  }).index("by_chat", ["chatId"])
    .index("by_sender", ["senderId"]),
});