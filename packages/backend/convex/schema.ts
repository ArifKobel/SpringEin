import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // Account-Typen: Person oder Team (Tagesstätte)
  accounts: defineTable({
    userId: v.string(), // Convex Auth uses string IDs
    accountType: v.union(v.literal("person"), v.literal("team")),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_accountType", ["accountType"]),

  // Profile für Person-Accounts (Tagesmütter/Väter)
  personProfiles: defineTable({
    userId: v.string(), // Convex Auth uses string IDs
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

  // Profile für Team-Accounts (Tagesstätten)
  teamProfiles: defineTable({
    userId: v.string(), // Convex Auth uses string IDs
    facilityName: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    postalCode: v.string(),
    phone: v.string(),
    contactPersonName: v.string(),
    facilityImages: v.optional(v.array(v.id("_storage"))),
  }).index("by_userId", ["userId"])
    .index("by_postalCode", ["postalCode"]),

  // Verfügbarkeiten für beide Account-Typen
  availabilities: defineTable({
    userId: v.string(), // Convex Auth uses string IDs
    type: v.union(v.literal("recurring"), v.literal("oneTime")),
    dayOfWeek: v.optional(v.number()),
    startTime: v.string(),
    endTime: v.string(),
    date: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_date", ["date"]),

  // Stellenanzeigen (nur von Team-Accounts erstellt)
  jobPostings: defineTable({
    teamId: v.string(), // Team-Account der die Anzeige erstellt
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
  }).index("by_teamId", ["teamId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_startDate", ["startDate"]),

  // Bewerbungen (Person-Accounts bewerben sich bei Team-Accounts)
  applications: defineTable({
    jobPostingId: v.id("jobPostings"),
    personId: v.string(), // Person-Account der sich bewirbt
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
    .index("by_person", ["personId"])
    .index("by_status", ["status"]),

  // Chats zwischen Person und Team
  chats: defineTable({
    personId: v.string(), // Person-Account
    teamId: v.string(),   // Team-Account
    createdAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    originApplicationId: v.optional(v.id("applications")),
  }).index("by_person", ["personId"])
    .index("by_team", ["teamId"])
    .index("by_participants", ["personId", "teamId"]),

  // Nachrichten in Chats
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.string(), // Convex Auth uses string IDs
    content: v.string(),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
  }).index("by_chat", ["chatId"])
    .index("by_sender", ["senderId"]),
});