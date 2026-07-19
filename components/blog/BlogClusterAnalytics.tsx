"use client";

import { useEffect } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import type { BlogClusterId } from "@/lib/blog/clusters";

export default function BlogClusterAnalytics({ cluster }: { cluster: BlogClusterId }) {
  useEffect(() => {
    pushGtmEvent("blog_cluster_view", {
      page: `blog/${cluster}`,
      cluster,
    });
  }, [cluster]);

  return null;
}
