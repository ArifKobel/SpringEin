import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const createSubstitutionRequest = mutation({
  args: {
    exchangeProfileId: v.id("exchangeProfiles"),
    ageGroups: v.array(v.string()),
    startDate: v.string(),
    endDate: v.string(),
    timeFrom: v.string(),
    timeTo: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const profile = await ctx.db.get(args.exchangeProfileId);
    if (!profile || profile.userId !== userId) {
      throw new Error("Not allowed");
    }
    const id = await ctx.db.insert("substitutionRequests", {
      ...args,
      userId,
      status: "open",
      createdAt: Date.now(),
    });
    // Auto-match: naive filter providers in same city who cover at least one requested age group
    const providers = await ctx.db
      .query("providerProfiles")
      .withIndex("by_city", (q) => q.eq("city", profile.city))
      .collect();
    const candidateProviders = providers.filter((p) =>
      args.ageGroups.some((ag) => p.ageGroups.includes(ag))
    );
    for (const p of candidateProviders) {
      await ctx.db.insert("requestMatches", {
        requestId: id,
        providerProfileId: p._id,
        providerUserId: p.userId,
        status: "pending",
        createdAt: Date.now(),
      });
    }
    return id;
  },
});

export const listOpenRequests = query({
  args: {
    city: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
  },
  handler: async (ctx, { city, ageGroup }) => {
    const requests = await ctx.db
      .query("substitutionRequests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    // Join with exchangeProfiles for city
    const profilesById = new Map();
    for (const r of requests) {
      if (!profilesById.has(r.exchangeProfileId)) {
        profilesById.set(
          r.exchangeProfileId,
          await ctx.db.get(r.exchangeProfileId)
        );
      }
    }
    return requests.filter((r) => {
      const profile = profilesById.get(r.exchangeProfileId);
      const cityOk = city ? profile?.city === city : true;
      const ageOk = ageGroup ? r.ageGroups.includes(ageGroup) : true;
      return cityOk && ageOk;
    });
  },
});

export const myRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("substitutionRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateRequestStatus = mutation({
  args: {
    requestId: v.id("substitutionRequests"),
    status: v.string(), // open | fulfilled | cancelled
  },
  handler: async (ctx, { requestId, status }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const req = await ctx.db.get(requestId);
    if (!req || req.userId !== userId) throw new Error("Not allowed");
    await ctx.db.patch(requestId, { status });
    return true;
  },
});

export const providerInbox = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const matches = await ctx.db
      .query("requestMatches")
      .withIndex("by_provider", (q) => q.eq("providerUserId", userId))
      .collect();
    // Join with request details
    const enriched = [] as Array<any>;
    for (const m of matches) {
      const req = await ctx.db.get(m.requestId);
      if (req) enriched.push({ match: m, request: req });
    }
    return enriched;
  },
});

export const setMatchStatus = mutation({
  args: {
    matchId: v.id("requestMatches"),
    status: v.string(), // pending | accepted | declined
  },
  handler: async (ctx, { matchId, status }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const m = await ctx.db.get(matchId);
    if (!m || m.providerUserId !== userId) throw new Error("Not allowed");
    await ctx.db.patch(matchId, { status });
    return true;
  },
});

export const applyToRequest = mutation({
  args: {
    requestId: v.id("substitutionRequests"),
    providerProfileId: v.id("providerProfiles"),
    coverNote: v.optional(v.string()),
    sharePhone: v.optional(v.boolean()),
    shareEmail: v.optional(v.boolean()),
    initialMessage: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, providerProfileId, coverNote, sharePhone, shareEmail, initialMessage }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const profile = await ctx.db.get(providerProfileId);
    if (!profile || profile.userId !== userId) throw new Error("Not allowed");
    const req = await ctx.db.get(requestId);
    if (!req) throw new Error("Request not found");
    const doc: any = {
      requestId,
      providerProfileId,
      providerUserId: userId,
      coverNote,
      status: "applied",
      createdAt: Date.now(),
    };
    if (initialMessage) doc.initialMessage = initialMessage;
    if (sharePhone && profile.phone) doc.sharedPhone = profile.phone;
    // If we later store auth email, we can add it here when shareEmail is true
    const id = await ctx.db.insert("requestApplications", doc);
    return id;
  },
});

export const listApplicationsForRequest = query({
  args: { requestId: v.id("substitutionRequests") },
  handler: async (ctx, { requestId }) => {
    const req = await ctx.db.get(requestId);
    if (!req) return [];
    // Only request owner can see
    const userId = await auth.getUserId(ctx);
    if (!userId || req.userId !== userId) return [];
    const apps = await ctx.db
      .query("requestApplications")
      .withIndex("by_request", (q) => q.eq("requestId", requestId))
      .collect();
    // Attach minimal provider profile
    const enriched = [] as Array<any>;
    for (const a of apps) {
      const prof = await ctx.db.get(a.providerProfileId);
      enriched.push({ application: a, providerProfile: prof });
    }
    return enriched;
  },
});

export const decideOnApplication = mutation({
  args: {
    applicationId: v.id("requestApplications"),
    status: v.string(), // accepted | declined
    message: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, status, message }) => {
    const app = await ctx.db.get(applicationId);
    if (!app) throw new Error("Not found");
    const req = await ctx.db.get(app.requestId);
    const userId = await auth.getUserId(ctx);
    if (!req || !userId || req.userId !== userId) throw new Error("Not allowed");
    await ctx.db.patch(applicationId, {
      status,
      decisionAt: Date.now(),
      initialMessage: message ?? app.initialMessage,
    });
    return true;
  },
});

