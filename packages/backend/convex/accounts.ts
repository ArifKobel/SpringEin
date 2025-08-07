import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new account after user registration
export const create = mutation({
  args: {
    accountType: v.union(v.literal("person"), v.literal("team")),
  },
  handler: async (ctx, { accountType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Check if account already exists
    const existingAccount = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingAccount) {
      throw new Error("Account already exists");
    }

    // Create new account
    const accountId = await ctx.db.insert("accounts", {
      userId,
      accountType,
      isActive: true,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    return accountId;
  },
});

// Get current user's account
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return account;
  },
});

// Update account activity
export const updateActivity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(account._id, {
      lastActiveAt: Date.now(),
    });
  },
});

// Get account by user ID (for admin/internal use)
export const getByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return account;
  },
});