import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Apply to a job (person accounts only)
export const create = mutation({
  args: {
    jobPostingId: v.id("jobPostings"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, { jobPostingId, message }) => {
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
      throw new Error("Only person accounts can apply to jobs");
    }

    // Check if job exists and is open
    const job = await ctx.db.get(jobPostingId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "open") {
      throw new Error("Job is not open for applications");
    }

    // Check if user already applied
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_jobPosting", (q) => q.eq("jobPostingId", jobPostingId))
      .filter((q) => q.eq(q.field("personId"), userId))
      .first();

    if (existingApplication) {
      throw new Error("You have already applied to this job");
    }

    // Create application
    const applicationId = await ctx.db.insert("applications", {
      jobPostingId,
      personId: userId,
      message,
      status: "pending",
      appliedAt: Date.now(),
    });

    return applicationId;
  },
});

// Get applications for a specific job (team accounts only)
export const getByJob = query({
  args: {
    jobPostingId: v.id("jobPostings"),
  },
  handler: async (ctx, { jobPostingId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Check if job exists and user owns it
    const job = await ctx.db.get(jobPostingId);
    if (!job || job.teamId !== userId) {
      throw new Error("Not authorized to view applications for this job");
    }

    // Get applications with person profile data
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_jobPosting", (q) => q.eq("jobPostingId", jobPostingId))
      .order("desc")
      .collect();

    // Enrich with person profile data
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const personProfile = await ctx.db
          .query("personProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", app.personId))
          .first();

        return {
          ...app,
          personProfile,
        };
      })
    );

    return enrichedApplications;
  },
});

// Get current user's applications (person accounts only)
export const getMy = query({
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

    // Get applications with job data
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_person", (q) => q.eq("personId", userId))
      .order("desc")
      .collect();

    // Enrich with job and team profile data
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        const job = await ctx.db.get(app.jobPostingId);
        let teamProfile = null;
        
        if (job) {
          teamProfile = await ctx.db
            .query("teamProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", job.teamId))
            .first();
        }

        return {
          ...app,
          job,
          teamProfile,
        };
      })
    );

    return enrichedApplications;
  },
});

// Update application status (team accounts only)
export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, { applicationId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Check if user owns the job
    const job = await ctx.db.get(application.jobPostingId);
    if (!job || job.teamId !== userId) {
      throw new Error("Not authorized to update this application");
    }

    // Update application
    await ctx.db.patch(applicationId, {
      status,
      respondedAt: Date.now(),
    });

    // If accepted, increment job matches
    if (status === "accepted") {
      await ctx.db.patch(application.jobPostingId, {
        currentMatches: job.currentMatches + 1,
      });

      // If max positions reached, close job
      if (job.currentMatches + 1 >= job.maxPositions) {
        await ctx.db.patch(application.jobPostingId, {
          status: "completed",
        });
      }
    }

    return applicationId;
  },
});

// Delete application (person accounts only)
export const remove = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, { applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Check if user owns this application
    if (application.personId !== userId) {
      throw new Error("Not authorized to delete this application");
    }

    // Can only delete pending applications
    if (application.status !== "pending") {
      throw new Error("Can only delete pending applications");
    }

    await ctx.db.delete(applicationId);
    return applicationId;
  },
});

// Get application statistics for a team
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    // Check if user has a team account
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!account || account.accountType !== "team") {
      return null;
    }

    // Get all jobs by this team
    const jobs = await ctx.db
      .query("jobPostings")
      .withIndex("by_teamId", (q) => q.eq("teamId", userId))
      .collect();

    const jobIds = jobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await ctx.db.query("applications").collect();
    const teamApplications = applications.filter(app => 
      jobIds.includes(app.jobPostingId)
    );

    return {
      totalJobs: jobs.length,
      openJobs: jobs.filter(job => job.status === "open").length,
      totalApplications: teamApplications.length,
      pendingApplications: teamApplications.filter(app => app.status === "pending").length,
      acceptedApplications: teamApplications.filter(app => app.status === "accepted").length,
    };
  },
});