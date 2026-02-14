import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User, Eye, Loader2 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BlogDetail() {
  const { t, language } = useLanguage();
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const slug = params.slug;

  // Veritabanından blog yazısını çek
  const {
    data: post,
    isLoading,
    error,
  } = trpc.blog.getBySlug.useQuery({ slug: slug || "" }, { enabled: !!slug });

  // İlgili blog yazıları
  const { data: relatedPosts } = trpc.blog.list.useQuery(
    { limit: 3, offset: 0, category: post?.category },
    { enabled: !!post?.category }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container">
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-neon-brand" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container">
            <div className="text-center py-32">
              <h1 className="text-2xl font-bold text-[#F9FAFB] mb-4">
                {t("blogDetail.notFound.title")}
              </h1>
              <p className="text-gray-400 mb-8">
                {t("blogDetail.notFound.description")}
              </p>
              <Link href="/blog">
                <Button className="bg-neon-brand text-black hover:bg-neon-brand/90">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("blogDetail.notFound.backButton")}
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Markdown içeriği basit HTML'e dönüştür
  const formatContent = (content: string) => {
    return (
      content
        // Başlıklar
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-xl font-bold text-[#F9FAFB] mt-8 mb-4">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-2xl font-bold text-[#F9FAFB] mt-10 mb-4">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-3xl font-bold text-[#F9FAFB] mt-12 mb-6">$1</h1>'
        )
        // Kalın ve italik
        .replace(
          /\*\*\*(.*?)\*\*\*/g,
          '<strong class="font-bold italic">$1</strong>'
        )
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-bold text-neon-brand">$1</strong>'
        )
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Listeler
        .replace(
          /^\- (.*$)/gim,
          '<li class="ml-4 text-gray-300 mb-2">• $1</li>'
        )
        .replace(
          /^\d+\. (.*$)/gim,
          '<li class="ml-4 text-gray-300 mb-2">$1</li>'
        )
        // Paragraflar
        .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
        // Kod blokları
        .replace(
          /`(.*?)`/g,
          '<code class="bg-white/10 px-2 py-1 rounded text-neon-brand">$1</code>'
        )
        // Satır sonları
        .replace(/\n/g, "<br />")
    );
  };

  const filteredRelatedPosts =
    relatedPosts?.posts.filter(p => p.slug !== slug).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link href="/blog">
            <Button
              variant="ghost"
              className="mb-8 text-gray-400 hover:text-[#F9FAFB]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("blogDetail.backButton")}
            </Button>
          </Link>

          {/* Article Header */}
          <article>
            <header className="mb-8">
              <span className="inline-block px-3 py-1 bg-neon-brand text-black text-xs font-bold rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F9FAFB] mb-6 leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-gray-400 mb-6">{post.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-white/10 pb-6">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(
                        language === "tr" ? "tr-TR" : "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {post.viewCount} {t("blogDetail.views")}
                </span>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-10 bg-white/5">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="text-gray-300 leading-relaxed mb-4">${formatContent(post.content)}</p>`,
              }}
            />
          </article>

          {/* Related Posts */}
          {filteredRelatedPosts.length > 0 && (
            <section className="mt-16 pt-10 border-t border-white/10">
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">
                {t("blogDetail.relatedPosts")}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {filteredRelatedPosts.map(relatedPost => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="bg-white/5 border-white/10 cursor-pointer hover:border-neon-brand/40 transition-all group h-full">
                      {relatedPost.coverImage && (
                        <div className="aspect-video rounded-t-xl overflow-hidden">
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                "/gallery/sample-1.jpg";
                            }}
                          />
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <span className="inline-block px-2 py-1 bg-white/10 text-neon-brand text-xs font-medium rounded w-fit mb-2">
                          {relatedPost.category}
                        </span>
                        <CardTitle className="text-lg text-[#F9FAFB] group-hover:text-neon-brand transition-colors line-clamp-2">
                          {relatedPost.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-400 line-clamp-2">
                          {relatedPost.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-neon-brand/10 to-[#FF2E97]/10 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">
              {t("blogDetail.cta.title")}
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              {t("blogDetail.cta.description")}
            </p>
            <Link href="/generate">
              <Button className="bg-neon-brand text-black hover:bg-neon-brand/90 font-bold px-8 py-6 text-lg rounded-full">
                {t("blogDetail.cta.button")}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
