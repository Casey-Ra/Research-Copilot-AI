export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*", "/search/:path*", "/chat/:path*", "/notes/:path*"],
};
