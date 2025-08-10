import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

async function geocodeAddress(address: string, city: string, postalCode?: string) {
  try {
    const q = [address, postalCode, city].filter(Boolean).join(", ");
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SpringEin/1.0 (contact: support@springein.app)",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<any>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon } as const;
    }
    return null;
  } catch {
    return null;
  }
}

export const createProviderProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    postalCode: v.string(),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    capacity: v.number(),
    ageGroups: v.array(v.string()),
    maxCommuteKm: v.number(),
    availableDays: v.array(v.string()),
    availableTimeFrom: v.string(),
    availableTimeTo: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    // Enforce at most one provider profile per user
    const existing = await ctx.db
      .query("providerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      throw new Error("Es ist bereits ein Anbieter-Profil vorhanden.");
    }
    const now = Date.now();
    const geo = args.latitude != null && args.longitude != null
      ? { latitude: args.latitude, longitude: args.longitude }
      : await geocodeAddress(args.address, args.city, args.postalCode);
    const latitude = args.latitude ?? geo?.latitude;
    const longitude = args.longitude ?? geo?.longitude;
    const { latitude: _la, longitude: _lo, ...rest } = args as any;
    const profileId = await ctx.db.insert("providerProfiles", {
      userId,
      displayName: args.displayName,
      ...(rest as any),
      ...(latitude != null ? { latitude } : {}),
      ...(longitude != null ? { longitude } : {}),
      createdAt: now,
    });
    return profileId;
  },
});

export const createExchangeProfile = mutation({
  args: {
    facilityName: v.string(),
    address: v.string(),
    city: v.string(),
    postalCode: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    // removed UI toggles for sharing from profile level
    ageGroups: v.optional(v.array(v.string())),
    openingDays: v.optional(v.array(v.string())),
    openingTimeFrom: v.optional(v.string()),
    openingTimeTo: v.optional(v.string()),
    openingHours: v.optional(v.array(v.object({ day: v.string(), from: v.string(), to: v.string() }))),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    // Enforce at most one exchange profile per user
    const existing = await ctx.db
      .query("exchangeProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      throw new Error("Es ist bereits ein Kindertagesstätte-Profil vorhanden.");
    }
    const now = Date.now();
    const geo = args.latitude != null && args.longitude != null
      ? { latitude: args.latitude, longitude: args.longitude }
      : await geocodeAddress(args.address, args.city, args.postalCode ?? undefined);
    const latitude = args.latitude ?? geo?.latitude;
    const longitude = args.longitude ?? geo?.longitude;
    const { latitude: _la, longitude: _lo, ...rest } = args as any;
    const id = await ctx.db.insert("exchangeProfiles", {
      userId,
      ...(rest as any),
      ...(latitude != null ? { latitude } : {}),
      ...(longitude != null ? { longitude } : {}),
      createdAt: now,
    });
    return id;
  },
});

export const myProviderProfiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("providerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const myExchangeProfiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("exchangeProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const setActiveProfile = mutation({
  args: {
    role: v.string(), // "provider" | "exchange"
    providerProfileId: v.optional(v.id("providerProfiles")),
    exchangeProfileId: v.optional(v.id("exchangeProfiles")),
  },
  handler: async (ctx, { role, providerProfileId, exchangeProfileId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const now = Date.now();
    // upsert userSettings
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        activeRole: role,
        activeProviderProfileId: providerProfileId,
        activeExchangeProfileId: exchangeProfileId,
        updatedAt: now,
      });
      return existing._id;
    }
    const id = await ctx.db.insert("userSettings", {
      userId,
      activeRole: role,
      activeProviderProfileId: providerProfileId,
      activeExchangeProfileId: exchangeProfileId,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const mySettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const searchProviders = query({
  args: {
    city: v.optional(v.string()),
    ageGroup: v.optional(v.string()),
    day: v.optional(v.string()), // e.g. Mon, Tue
  },
  handler: async (ctx, { city, ageGroup, day }) => {
    let results;
    if (city) {
      results = await ctx.db
        .query("providerProfiles")
        .withIndex("by_city", (qi) => qi.eq("city", city))
        .collect();
    } else {
      results = await ctx.db.query("providerProfiles").collect();
    }
    return results.filter((p) =>
      (ageGroup ? p.ageGroups.includes(ageGroup) : true) &&
      (day ? p.availableDays.includes(day) : true)
    );
  },
});

export const updateProviderProfile = mutation({
  args: {
    profileId: v.id("providerProfiles"),
    displayName: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    postalCode: v.string(),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    capacity: v.number(),
    ageGroups: v.array(v.string()),
    maxCommuteKm: v.number(),
    availableDays: v.array(v.string()),
    availableTimeFrom: v.string(),
    availableTimeTo: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const current = await ctx.db.get(args.profileId);
    if (!current || current.userId !== userId) throw new Error("Not allowed");
    const geo = args.latitude != null && args.longitude != null
      ? { latitude: args.latitude, longitude: args.longitude }
      : await geocodeAddress(args.address, args.city, args.postalCode);
    await ctx.db.patch(args.profileId, {
      displayName: args.displayName,
      address: args.address,
      city: args.city,
      postalCode: args.postalCode,
      latitude: args.latitude ?? geo?.latitude,
      longitude: args.longitude ?? geo?.longitude,
      capacity: args.capacity,
      ageGroups: args.ageGroups,
      maxCommuteKm: args.maxCommuteKm,
      availableDays: args.availableDays,
      availableTimeFrom: args.availableTimeFrom,
      availableTimeTo: args.availableTimeTo,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
    });
    return true;
  },
});

export const updateExchangeProfile = mutation({
  args: {
    profileId: v.id("exchangeProfiles"),
    facilityName: v.string(),
    address: v.string(),
    city: v.string(),
    postalCode: v.optional(v.string()),
    contactPersonName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    ageGroups: v.optional(v.array(v.string())),
    openingDays: v.optional(v.array(v.string())),
    openingTimeFrom: v.optional(v.string()),
    openingTimeTo: v.optional(v.string()),
    openingHours: v.optional(v.array(v.object({ day: v.string(), from: v.string(), to: v.string() }))),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const current = await ctx.db.get(args.profileId);
    if (!current || current.userId !== userId) throw new Error("Not allowed");
    const geo = args.latitude != null && args.longitude != null
      ? { latitude: args.latitude, longitude: args.longitude }
      : await geocodeAddress(args.address, args.city, args.postalCode ?? undefined);
    await ctx.db.patch(args.profileId, {
      facilityName: args.facilityName,
      address: args.address,
      city: args.city,
      postalCode: args.postalCode,
      contactPersonName: args.contactPersonName,
      phone: args.phone,
      email: args.email,
      ageGroups: args.ageGroups,
      openingDays: args.openingDays,
      openingTimeFrom: args.openingTimeFrom,
      openingTimeTo: args.openingTimeTo,
      openingHours: args.openingHours,
      latitude: args.latitude ?? geo?.latitude,
      longitude: args.longitude ?? geo?.longitude,
      bio: args.bio,
    });
    return true;
  },
});

