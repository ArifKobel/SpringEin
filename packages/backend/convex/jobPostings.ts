import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create job posting (only for team accounts)
export const create = mutation({
  args: {
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
    expiresAt: v.optional(v.number()),
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
      throw new Error("Only team accounts can create job postings");
    }

    // Create job posting
    const jobId = await ctx.db.insert("jobPostings", {
      teamId: userId,
      title: args.title,
      description: args.description,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      daysOfWeek: args.daysOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      ageGroups: args.ageGroups,
      maxPositions: args.maxPositions,
      currentMatches: 0,
      status: "open",
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });

    return jobId;
  },
});

// Get job postings created by current user (team accounts only)
export const getMy = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Check if user has a team account
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account || account.accountType !== "team") {
      return [];
    }

    const jobs = await ctx.db
      .query("jobPostings")
      .withIndex("by_teamId", (q) => q.eq("teamId", userId))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Get available job postings (for person accounts)
export const getAvailable = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Check if user has a person account
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account || account.accountType !== "person") {
      return [];
    }

    // Get open job postings
    const jobs = await ctx.db
      .query("jobPostings")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .collect();

    // Filter out expired jobs
    const now = Date.now();
    const activeJobs = jobs.filter(job => 
      !job.expiresAt || job.expiresAt > now
    );

    return activeJobs;
  },
});

// Get job posting by ID
export const getById = query({
  args: {
    jobId: v.id("jobPostings"),
  },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    return job;
  },
});

// Update job posting
export const update = mutation({
  args: {
    jobId: v.id("jobPostings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("substitute"), v.literal("longterm"))),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.number())),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    ageGroups: v.optional(v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    ))),
    maxPositions: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("open"), 
      v.literal("inProgress"), 
      v.literal("completed"), 
      v.literal("expired")
    )),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { jobId, ...args }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if user owns this job
    if (job.teamId !== userId) {
      throw new Error("Not authorized to update this job");
    }

    // Update only provided fields
    const updateData: any = {};
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await ctx.db.patch(jobId, updateData);
    return jobId;
  },
});

// Delete job posting
export const remove = mutation({
  args: {
    jobId: v.id("jobPostings"),
  },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if user owns this job
    if (job.teamId !== userId) {
      throw new Error("Not authorized to delete this job");
    }

    await ctx.db.delete(jobId);
    return jobId;
  },
});

// Search job postings with filters
export const search = query({
  args: {
    postalCode: v.optional(v.string()),
    ageGroups: v.optional(v.array(v.union(
      v.literal("0-1"), 
      v.literal("1-3"), 
      v.literal("3-6")
    ))),
    type: v.optional(v.union(v.literal("substitute"), v.literal("longterm"))),
  },
  handler: async (ctx, { postalCode, ageGroups, type }) => {
    let jobs = await ctx.db
      .query("jobPostings")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();

    // Filter by age groups if provided
    if (ageGroups && ageGroups.length > 0) {
      jobs = jobs.filter(job =>
        job.ageGroups.some(group => ageGroups.includes(group))
      );
    }

    // Filter by type if provided
    if (type) {
      jobs = jobs.filter(job => job.type === type);
    }

    // Filter by postal code (would need team profile data)
    if (postalCode) {
      const teamProfiles = await ctx.db.query("teamProfiles").collect();
      const teamsInArea = teamProfiles
        .filter(profile => profile.postalCode === postalCode)
        .map(profile => profile.userId);
      
      jobs = jobs.filter(job => teamsInArea.includes(job.teamId));
    }

    // Filter out expired jobs
    const now = Date.now();
    const activeJobs = jobs.filter(job => 
      !job.expiresAt || job.expiresAt > now
    );

    return activeJobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});