import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create person profile
export const create = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if user has a person account
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account || account.accountType !== "person") {
      throw new Error("User must have a person account");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("personProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Create profile
    const profileId = await ctx.db.insert("personProfiles", {
      userId,
      name: args.name,
      bio: args.bio,
      postalCode: args.postalCode,
      phone: args.phone,
      maxTravelDistance: args.maxTravelDistance,
      ageGroups: args.ageGroups,
      sharePhone: args.sharePhone,
      shareEmail: args.shareEmail,
    });

    return profileId;
  },
});

// Get current user's person profile
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const profile = await ctx.db
      .query("personProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Update person profile
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    maxTravelDistance: v.optional(v.number()),
    ageGroups: v.optional(v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    ))),
    sharePhone: v.optional(v.boolean()),
    shareEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const profile = await ctx.db
      .query("personProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Update only provided fields
    const updateData: any = {};
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await ctx.db.patch(profile._id, updateData);
    return profile._id;
  },
});

// Search person profiles by postal code and filters
export const search = query({
  args: {
    postalCode: v.optional(v.string()),
    maxDistance: v.optional(v.number()),
    ageGroups: v.optional(v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    ))),
  },
  handler: async (ctx, { postalCode, maxDistance, ageGroups }) => {
    let profiles = await ctx.db.query("personProfiles").collect();

    // Filter by postal code if provided
    if (postalCode) {
      profiles = profiles.filter(profile => 
        profile.postalCode === postalCode ||
        (maxDistance && profile.maxTravelDistance >= (maxDistance || 0))
      );
    }

    // Filter by age groups if provided
    if (ageGroups && ageGroups.length > 0) {
      profiles = profiles.filter(profile =>
        profile.ageGroups.some(group => ageGroups.includes(group))
      );
    }

    return profiles;
  },
});

// Get person profile by user ID
export const getByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("personProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});