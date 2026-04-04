import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*", "/search/:path*", "/chat/:path*", "/notes/:path*"],
};
