/**
 * Migrate static blog catalog entries into CMS (idempotent).
 * Usage: npx tsx scripts/migrate-blog-to-cms.ts [--dry-run]
 */
import { blogPosts } from '../lib/blog/posts';
import { EMPTY_DOC } from '../lib/cms/types';
import { toPersianSafeSlug } from '../lib/cms/slugUtils';

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const { getSupabaseAdmin } = await import('../lib/supabase');
  const supabase = getSupabaseAdmin();

  const { data: author } = await supabase.from('cms_authors').select('id').eq('slug', 'araaye').maybeSingle();
  const authorId = author?.id ?? null;

  const report: { slug: string; action: string; error?: string }[] = [];

  for (const post of blogPosts) {
    if (!post.href.startsWith('/blog/')) continue;

    const { data: existingRun } = await supabase
      .from('cms_migration_runs')
      .select('article_id')
      .eq('source_slug', post.slug)
      .maybeSingle();

    if (existingRun?.article_id) {
      report.push({ slug: post.slug, action: 'skipped_existing' });
      continue;
    }

    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: post.description }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'این مقاله از محتوای استاتیک migrate شده است. بدنه کامل را در ویرایشگر بازنویسی کنید.',
            },
          ],
        },
      ],
    };

    const row = {
      title: post.title,
      slug: post.slug || toPersianSafeSlug(post.title),
      excerpt: post.description,
      content_json: content,
      status: 'DRAFT',
      author_id: authorId,
      seo_title: post.title,
      seo_description: post.description,
      word_count: post.description.split(/\s+/).length + 20,
      reading_time: parseInt(post.readTime, 10) || 5,
    };

    if (dryRun) {
      report.push({ slug: post.slug, action: 'would_insert' });
      continue;
    }

    const { data: inserted, error } = await supabase.from('cms_articles').insert(row).select('id').single();
    if (error) {
      if (error.code === '23505') {
        report.push({ slug: post.slug, action: 'duplicate_slug' });
      } else {
        report.push({ slug: post.slug, action: 'error', error: error.message });
      }
      continue;
    }

    await supabase.from('cms_migration_runs').insert({
      source_slug: post.slug,
      article_id: inserted.id,
      source_type: 'posts_catalog',
    });

    report.push({ slug: post.slug, action: 'inserted' });
  }

  console.log(JSON.stringify({ dryRun, total: report.length, report }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
