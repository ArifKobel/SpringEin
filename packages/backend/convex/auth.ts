import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTP } from "./resendOTP";
 
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({
    verify: ResendOTP,
  })],
});