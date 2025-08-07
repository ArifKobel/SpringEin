/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as jobPostings from "../jobPostings.js";
import type * as personProfiles from "../personProfiles.js";
import type * as resendOTP from "../resendOTP.js";
import type * as teamProfiles from "../teamProfiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  applications: typeof applications;
  auth: typeof auth;
  healthCheck: typeof healthCheck;
  http: typeof http;
  jobPostings: typeof jobPostings;
  personProfiles: typeof personProfiles;
  resendOTP: typeof resendOTP;
  teamProfiles: typeof teamProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
