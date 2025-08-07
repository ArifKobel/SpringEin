import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create team profile
export const create = mutation({
  args: {
    facilityName: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    postalCode: v.string(),
    phone: v.string(),
    contactPersonName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if user has a team account
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account || account.accountType !== "team") {
      throw new Error("User must have a team account");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("teamProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Create profile
    const profileId = await ctx.db.insert("teamProfiles", {
      userId,
      facilityName: args.facilityName,
      description: args.description,
      address: args.address,
      postalCode: args.postalCode,
      phone: args.phone,
      contactPersonName: args.contactPersonName,
    });

    return profileId;
  },
});

// Get current user's team profile
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const profile = await ctx.db
      .query("teamProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Update team profile
export const update = mutation({
  args: {
    facilityName: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const profile = await ctx.db
      .query("teamProfiles")
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

// Search team profiles by postal code
export const search = query({
  args: {
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, { postalCode }) => {
    let profiles = await ctx.db.query("teamProfiles").collect();

    // Filter by postal code if provided
    if (postalCode) {
      profiles = profiles.filter(profile => 
        profile.postalCode === postalCode
      );
    }

    return profiles;
  },
});

// Get team profile by user ID
export const getByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("teamProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});