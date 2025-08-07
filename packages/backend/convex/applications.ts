import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Alle Bewerbungen für alle Anfragen der Kindertagesstätte
export const myApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    // Finde alle Anfragen der Kindertagesstätte
    const myRequests = await ctx.db
      .query("substitutionRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Sammle alle Bewerbungen für diese Anfragen
    const allApplications = [];
    for (const req of myRequests) {
      const apps = await ctx.db
        .query("requestApplications")
        .withIndex("by_request", (q) => q.eq("requestId", req._id))
        .collect();
      
      for (const app of apps) {
        const providerProfile = await ctx.db.get(app.providerProfileId);
        allApplications.push({
          application: app,
          request: req,
          providerProfile,
        });
      }
    }
    
    return allApplications.sort((a, b) => b.application.createdAt - a.application.createdAt);
  },
});

// Einzelne Bewerbung mit Details
export const getApplicationDetails = query({
  args: { applicationId: v.id("requestApplications") },
  handler: async (ctx, { applicationId }) => {
    const app = await ctx.db.get(applicationId);
    if (!app) return null;
    
    const request = await ctx.db.get(app.requestId);
    const providerProfile = await ctx.db.get(app.providerProfileId);
    
    // Prüfe, ob der aktuelle User die Berechtigung hat
    const userId = await auth.getUserId(ctx);
    if (!userId || !request || request.userId !== userId) return null;
    
    return {
      application: app,
      request,
      providerProfile,
    };
  },
});

// Bewerbung annehmen/ablehnen
export const decideApplication = mutation({
  args: {
    applicationId: v.id("requestApplications"),
    status: v.string(), // "accepted" | "declined"
    message: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, status, message }) => {
    const app = await ctx.db.get(applicationId);
    if (!app) throw new Error("Bewerbung nicht gefunden");
    
    const request = await ctx.db.get(app.requestId);
    const userId = await auth.getUserId(ctx);
    if (!userId || !request || request.userId !== userId) {
      throw new Error("Nicht berechtigt");
    }
    
    await ctx.db.patch(applicationId, {
      status,
      decisionAt: Date.now(),
      ...(message && { initialMessage: message }),
    });
    
    return true;
  },
});

// Provider-Profil anzeigen (für Kindertagesstätte)
export const getProviderProfile = query({
  args: { profileId: v.id("providerProfiles") },
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId);
    if (!profile) return null;
    
    // Hier könnten wir später Berechtigungen prüfen
    // Für jetzt: alle können Provider-Profile sehen
    return profile;
  },
});