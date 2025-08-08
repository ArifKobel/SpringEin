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
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map((x) => Number(x));
      return h * 60 + m;
    };
    const reqFrom = toMinutes(args.timeFrom);
    const reqTo = toMinutes(args.timeTo);
    const getDayCode = (d: Date) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    const enumerateDays = (start: string, end: string): string[] => {
      const out: string[] = [];
      const s = new Date(start + "T00:00:00");
      const e = new Date(end + "T00:00:00");
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        out.push(getDayCode(d));
      }
      return Array.from(new Set(out));
    };
    const requestedDays = enumerateDays(args.startDate, args.endDate);
    const hasTimeOverlap = (p: any) => {
      const pFrom = toMinutes(p.availableTimeFrom);
      const pTo = toMinutes(p.availableTimeTo);
      return reqFrom < pTo && reqTo > pFrom;
    };
    const hasDayOverlap = (p: any) => {
      if (!Array.isArray(p.availableDays) || p.availableDays.length === 0) return true;
      return p.availableDays.some((d: string) => requestedDays.includes(d));
    };
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    const withinDistance = (p: any) => {
      if (
        profile?.latitude != null && profile?.longitude != null &&
        p.latitude != null && p.longitude != null
      ) {
        const dist = haversineKm(profile.latitude, profile.longitude, p.latitude, p.longitude);
        // p.maxCommuteKm ist verpflichtend im Schema; fallback auf 0 falls undefiniert
        const maxKm = typeof p.maxCommuteKm === "number" ? p.maxCommuteKm : 0;
        return dist <= maxKm;
      }
      // Wenn keine Geodaten vorhanden sind, lassen wir den Provider (vorerst) zu, um Matching nicht zu blockieren.
      return true;
    };
    const candidateProviders = providers.filter((p) =>
      p.capacity > 0 &&
      args.ageGroups.some((ag) => p.ageGroups.includes(ag)) &&
      hasTimeOverlap(p) &&
      hasDayOverlap(p) &&
      withinDistance(p)
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
      if (!req) continue;
      const exchangeProfile = await ctx.db.get(req.exchangeProfileId);
      // find own application for this request (if exists)
      const apps = await ctx.db
        .query("requestApplications")
        .withIndex("by_request", (q) => q.eq("requestId", m.requestId))
        .collect();
      const myApp = apps.find((a) => a.providerUserId === userId && a.providerProfileId === m.providerProfileId);
      enriched.push({ match: m, request: req, exchangeProfile: exchangeProfile ?? null, application: myApp ?? null });
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

// Counts of applications for all of my requests
export const applicationCountsForMyRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const myRequests = await ctx.db
      .query("substitutionRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const results: Array<{ requestId: string; count: number }> = [];
    for (const r of myRequests) {
      const apps = await ctx.db
        .query("requestApplications")
        .withIndex("by_request", (q) => q.eq("requestId", r._id))
        .collect();
      results.push({ requestId: r._id, count: apps.length });
    }
    return results;
  },
});

// Request details for providers incl. exchange profile and my application status
export const getRequestDetailsForProvider = query({
  args: { requestId: v.id("substitutionRequests") },
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request) return null;
    const exchangeProfile = await ctx.db.get(request.exchangeProfileId);
    const userId = await auth.getUserId(ctx);
    let myApplication: any = null;
    if (userId) {
      const apps = await ctx.db
        .query("requestApplications")
        .withIndex("by_request", (q) => q.eq("requestId", requestId))
        .collect();
      myApplication = apps.find((a) => a.providerUserId === userId) ?? null;
    }
    return { request, exchangeProfile, myApplication };
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

