import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/faq", "/how-it-works", "/risk", "/roadmap", "/start", "/status", "/tokenomics"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/status" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
