import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";
import type { BlogClusterDef } from "@/lib/blog/clusters";
import { resolveClusterPosts } from "@/lib/blog/clusters";
import type { BlogPost } from "@/lib/blog/posts";
import BlogClusterAnalytics from "@/components/blog/BlogClusterAnalytics";

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-shadow hover:shadow-md">
      <Link href={post.href} className="block" aria-label={post.title}>
        {post.coverSrc ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
            <img
              src={post.coverSrc}
              alt=""
              width={640}
              height={360}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute top-3 right-3 rounded-lg bg-brand-700/95 px-2.5 py-1 text-xs font-bold text-white">
              {post.category}
            </span>
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-end bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 p-5">
            <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
              {post.category}
            </span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-navy-400">
          <span>{post.dateLabel}</span>
          <span className="h-1 w-1 rounded-full bg-navy-200" aria-hidden="true" />
          <span>{post.readTime}</span>
        </div>
        <h3 className="mt-2 text-balance text-base font-extrabold leading-snug text-navy-900 sm:text-lg">
          <Link href={post.href} className="transition-colors hover:text-brand-700">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{post.description}</p>
        <Link
          href={post.href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-600"
        >
          ادامه مطلب
          <IconArrowLeft size={15} />
        </Link>
      </div>
    </article>
  );
}

function ArticleListLinks({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={post.href}
            className="block rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm font-bold text-navy-800 transition-colors hover:border-brand-200 hover:text-brand-700"
          >
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function BlogClusterHub({ cluster }: { cluster: BlogClusterDef }) {
  const featured = resolveClusterPosts(cluster.featuredSlugs);
  const latest = resolveClusterPosts(cluster.latestSlugs);
  const allLinked = resolveClusterPosts(cluster.relatedSlugs);
  const hubLabel = cluster.id === "doctors" ? "پزشکان" : "هوش مصنوعی";

  return (
    <>
      <BlogClusterAnalytics cluster={cluster.id} />

      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_85%_-10%,theme(colors.navy.600)_0%,theme(colors.navy.800)_45%,theme(colors.navy.900)_100%)]"
          aria-hidden="true"
        />
        <div className="container-mx container-px relative py-10 sm:py-14">
          <nav className="text-sm text-white/60" aria-label="مسیر صفحه">
            <Link href="/" className="hover:text-white">
              آرایه
            </Link>
            <span className="px-2">/</span>
            <Link href="/blog" className="hover:text-white">
              بلاگ
            </Link>
            <span className="px-2">/</span>
            <span className="text-white/90">{hubLabel}</span>
          </nav>

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <h1 className="text-balance text-3xl font-extrabold leading-[1.35] tracking-tight sm:text-4xl">
              {cluster.h1}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {cluster.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-navy-100 bg-white py-10 sm:py-12" aria-labelledby="topics-heading">
        <div className="container-mx container-px">
          <h2 id="topics-heading" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            موضوعات اصلی
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-500 sm:text-base">
            هر موضوع یک مسیر مشخص دارد؛ مقاله برای یادگیری و صفحه خدمات برای اجرا.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cluster.topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5"
              >
                <h3 className="text-base font-extrabold text-navy-900">{topic.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-white py-10 sm:py-12" aria-labelledby="featured-heading">
          <div className="container-mx container-px">
            <h2 id="featured-heading" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
              مقالات ویژه
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-navy-100 bg-navy-50/30 py-10 sm:py-12" aria-labelledby="latest-heading">
        <div className="container-mx container-px">
          <h2 id="latest-heading" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            {latest.length > 0 ? "جدیدترین مقالات" : "مقالات این خوشه"}
          </h2>
          {latest.length > 0 || allLinked.length > 0 ? (
            <ArticleListLinks posts={latest.length > 0 ? latest : allLinked} />
          ) : (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-500">
              {cluster.emptyArticlesNote ?? "هنوز مقاله‌ای در این خوشه منتشر نشده است."}
            </p>
          )}
          {cluster.id === "ai" && allLinked.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-base font-extrabold text-navy-900">مرتبط با AI</h3>
              <ArticleListLinks posts={allLinked} />
            </div>
          ) : null}
          {cluster.id === "doctors" && allLinked.length > latest.length ? (
            <div className="mt-8">
              <h3 className="text-base font-extrabold text-navy-900">همه مقالات مرتبط</h3>
              <ArticleListLinks posts={allLinked} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-10 sm:py-12" aria-labelledby="services-heading">
        <div className="container-mx container-px">
          <h2 id="services-heading" className="text-xl font-extrabold text-navy-900 sm:text-2xl">
            صفحات خدمات
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-500">
            برای اجرای عملی، به صفحه محصول یا سرویس مربوطه بروید.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cluster.serviceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-extrabold text-navy-900 group-hover:text-brand-700">
                  {link.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{link.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  مشاهده صفحه
                  <IconArrowLeft size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-navy-100 bg-navy-900 py-14 text-white sm:py-16">
        <div className="container-mx container-px max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{cluster.cta.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
            {cluster.cta.description}
          </p>
          <Link
            href={cluster.cta.href}
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-400"
          >
            {cluster.cta.label}
          </Link>
        </div>
      </section>
    </>
  );
}
