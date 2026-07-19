"use client";

import { useState } from "react";
import Link from "next/link";
import ChatOpenButton from "@/components/home/ChatOpenButton";
import { IconArrowLeft } from "@/components/icons";
import {
  blogPosts,
  blogTopics,
  type BlogPost,
  type BlogTopic,
} from "@/lib/blog/posts";

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-navy-400">
      <span>{post.dateLabel}</span>
      <span className="h-1 w-1 rounded-full bg-navy-200" aria-hidden="true" />
      <span>{post.readTime}</span>
    </div>
  );
}

function PostCover({ post, className }: { post: BlogPost; className?: string }) {
  if (!post.coverSrc) {
    return (
      <div
        className={`flex items-end bg-gradient-to-br from-navy-900 via-navy-800 to-brand-700 p-5 ${className ?? ""}`}
      >
        <span className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
          {post.category}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-navy-900 ${className ?? ""}`}>
      <img
        src={post.coverSrc}
        alt=""
        width={640}
        height={360}
        loading="lazy"
        className="h-full w-full object-cover"
        aria-hidden="true"
      />
      <span className="absolute top-3 right-3 rounded-lg bg-brand-700/95 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
        {post.category}
      </span>
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
      <div className="grid lg:grid-cols-2">
        <Link href={post.href} className="block min-h-[220px] lg:min-h-full" aria-label={post.title}>
          <PostCover post={post} className="h-full min-h-[220px] lg:min-h-[320px]" />
        </Link>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <PostMeta post={post} />
          <h2 className="mt-3 text-balance text-xl font-extrabold leading-snug text-navy-900 sm:text-2xl">
            <Link href={post.href} className="transition-colors hover:text-brand-700">
              {post.title}
            </Link>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500 sm:text-base">{post.description}</p>
          <Link
            href={post.href}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-600"
          >
            {post.ctaLabel ?? "ادامه مطلب"}
            <IconArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-shadow hover:shadow-md">
      <Link href={post.href} className="block" aria-label={post.title}>
        <PostCover post={post} className="aspect-[16/9]" />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <PostMeta post={post} />
        <h3 className="mt-2 text-balance text-base font-extrabold leading-snug text-navy-900 sm:text-lg">
          <Link href={post.href} className="transition-colors hover:text-brand-700">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{post.description}</p>
        <Link
          href={post.href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition-colors hover:text-brand-600"
        >
          {post.ctaLabel ?? "ادامه مطلب"}
          <IconArrowLeft size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function BlogIndexContent() {
  const [activeTopic, setActiveTopic] = useState<BlogTopic>("همه");

  const filtered =
    activeTopic === "همه" ? blogPosts : blogPosts.filter((post) => post.topic === activeTopic);

  const featured = activeTopic === "همه" ? filtered.find((post) => post.featured) : undefined;
  const gridPosts = featured ? filtered.filter((post) => post !== featured) : filtered;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_85%_-10%,theme(colors.navy.600)_0%,theme(colors.navy.800)_45%,theme(colors.navy.900)_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:100%_34px] [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]"
          aria-hidden="true"
        />

        <div className="container-mx container-px relative py-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-3xl font-extrabold leading-[1.35] tracking-tight sm:text-4xl lg:text-[2.6rem]">
              راهنمای عملی رشد آنلاین کسب‌وکار شما
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              هر هفته یاد می‌گیرید چطور سایت‌تان دیده شود، اعتماد بسازد و مشتری بیاورد: از سئو و
              طراحی تبدیل‌محور تا چت‌بات هوشمند و اتوماسیون فروش.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-navy-100 bg-white py-5 sm:py-6" aria-label="خوشه‌های محتوا">
        <div className="container-mx container-px">
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            <Link
              href="/blog/doctors"
              className="rounded-2xl border border-navy-100 bg-navy-50/50 px-5 py-4 transition-colors hover:border-brand-200 hover:bg-white"
            >
              <p className="text-xs font-bold text-brand-700">خوشه پزشکان</p>
              <p className="mt-1 text-base font-extrabold text-navy-900">
                راهنمای طراحی سایت و سئو پزشکان
              </p>
              <p className="mt-1 text-sm text-navy-500">مقالات پزشکی، کلینیک و جذب بیمار</p>
            </Link>
            <Link
              href="/blog/ai"
              className="rounded-2xl border border-navy-100 bg-navy-50/50 px-5 py-4 transition-colors hover:border-brand-200 hover:bg-white"
            >
              <p className="text-xs font-bold text-brand-700">خوشه هوش مصنوعی</p>
              <p className="mt-1 text-base font-extrabold text-navy-900">راهنمای کاربردی هوش مصنوعی</p>
              <p className="mt-1 text-sm text-navy-500">آموزش عملی مدل‌ها، پرامپت و Compare</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-navy-100 bg-white py-4 sm:py-5" aria-label="موضوعات">
        <div className="container-mx container-px">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {blogTopics.map((topic) => {
              const count =
                topic === "همه"
                  ? blogPosts.length
                  : blogPosts.filter((post) => post.topic === topic).length;
              if (topic !== "همه" && count === 0) return null;

              const isActive = activeTopic === topic;

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={
                    isActive
                      ? "rounded-xl border border-navy-900 bg-navy-900 px-3.5 py-2 text-sm font-medium text-white"
                      : "rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-sm font-medium text-navy-600 transition-colors hover:border-navy-200 hover:bg-navy-50 hover:text-navy-900"
                  }
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-12" id="posts">
        <div className="container-mx container-px space-y-8">
          {featured && <FeaturedCard post={featured} />}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-navy-100 bg-navy-50/40 py-14 sm:py-16">
        <div className="container-mx container-px max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">
            می‌خواهید مسیر رشد را برای کسب‌وکارتان مشخص کنیم؟
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500 sm:text-base">
            کوتاه بگویید کجا هستید؛ پیشنهاد مناسب را برای دیده‌شدن، جذب مشتری و پیگیری درخواست‌ها
            مشخص می‌کنیم.
          </p>
          <ChatOpenButton
            location="blog_index_cta"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-navy-900 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 active:scale-[0.98]"
          >
            درخواست مشاوره رایگان
          </ChatOpenButton>
        </div>
      </section>
    </>
  );
}
