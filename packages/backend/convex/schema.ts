import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  providerProfiles: defineTable({
    userId: v.id("users"),
    phone: v.optional(v.string()),
    sharePhone: v.optional(v.boolean()),
    shareEmail: v.optional(v.boolean()),
    address: v.string(),
    city: v.string(),
    postalCode: v.string(),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    capacity: v.number(),
    ageGroups: v.array(v.string()),
    maxCommuteKm: v.number(),
    availableDays: v.array(v.string()),
    availableTimeFrom: v.string(), // HH:mm
    availableTimeTo: v.string(),   // HH:mm
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // list my profiles
    .index("by_city", ["city"]),

  exchangeProfiles: defineTable({
    userId: v.id("users"),
    facilityName: v.string(),
    address: v.string(),
    city: v.string(),
    postalCode: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    phone: v.optional(v.string()),
    sharePhone: v.optional(v.boolean()),
    shareEmail: v.optional(v.boolean()),
    ageGroups: v.optional(v.array(v.string())),
    openingDays: v.optional(v.array(v.string())),
    openingTimeFrom: v.optional(v.string()), // HH:mm
    openingTimeTo: v.optional(v.string()),   // HH:mm
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // list my exchange profiles
    .index("by_city", ["city"]),

  substitutionRequests: defineTable({
    exchangeProfileId: v.id("exchangeProfiles"),
    userId: v.id("users"),
    ageGroups: v.array(v.string()),
    startDate: v.string(), // ISO date (YYYY-MM-DD)
    endDate: v.string(),   // ISO date (YYYY-MM-DD)
    timeFrom: v.string(),  // HH:mm
    timeTo: v.string(),    // HH:mm
    notes: v.optional(v.string()),
    status: v.string(), // open | fulfilled | cancelled
    createdAt: v.number(),
  })
    .index("by_exchange", ["exchangeProfileId"]) // list for a profile
    .index("by_user", ["userId"]) // list my requests
    .index("by_status", ["status"]), // open requests

  requestMatches: defineTable({
    requestId: v.id("substitutionRequests"),
    providerProfileId: v.id("providerProfiles"),
    providerUserId: v.id("users"),
    status: v.string(), // pending | accepted | declined
    createdAt: v.number(),
  })
    .index("by_provider", ["providerUserId"]) // provider inbox
    .index("by_request", ["requestId"]) // requestor view

  ,userSettings: defineTable({
    userId: v.id("users"),
    activeRole: v.optional(v.string()), // "provider" | "exchange"
    activeProviderProfileId: v.optional(v.id("providerProfiles")),
    activeExchangeProfileId: v.optional(v.id("exchangeProfiles")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]) 

  ,requestApplications: defineTable({
    requestId: v.id("substitutionRequests"),
    providerProfileId: v.id("providerProfiles"),
    providerUserId: v.id("users"),
    coverNote: v.optional(v.string()),
    status: v.string(), // applied | accepted | declined
    sharedPhone: v.optional(v.string()),
    sharedEmail: v.optional(v.string()),
    initialMessage: v.optional(v.string()),
    createdAt: v.number(),
    decisionAt: v.optional(v.number()),
  })
    .index("by_request", ["requestId"]) // list applications for a request
    .index("by_provider", ["providerUserId"]) // provider's applications
});