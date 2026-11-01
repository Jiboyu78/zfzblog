import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '@/config';

export async function GET(context: any) {
  const posts = await getCollection('blog', ({ data }: any) => !data.draft);
  const sorted = posts.sort(
    (a: any, b: any) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: sorted.map((post: any) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: '<language>zh-cn</language>',
  });
}
