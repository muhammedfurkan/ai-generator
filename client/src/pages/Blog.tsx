import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  Search,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  category: string;
  author: string;
  readTime: string;
  status: "draft" | "published" | "archived";
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function Blog() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // İlk render'da selectedCategory'yi ayarla
  const effectiveCategory = selectedCategory ?? t("blog.allCategories");

  // Veritabanından blog yazılarını çek
  const { data: postsData, isLoading } = trpc.blog.list.useQuery({
    limit: 50,
    offset: 0,
    category:
      effectiveCategory === t("blog.allCategories")
        ? undefined
        : effectiveCategory,
    search: searchQuery || undefined,
  });

  // Kategorileri veritabanından çek
  const { data: categories } = trpc.blog.getCategories.useQuery();

  const posts = postsData?.posts || [];
  const categoryList = categories || [t("blog.allCategories")];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
              AI İçerik <span className="text-neon-brand">Blog</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              AI görsel ve video oluşturma hakkında en güncel bilgiler, ipuçları
              ve rehberler
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("blog.searchPlaceholder")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[#F9FAFB] placeholder:text-gray-500 focus:outline-none focus:border-neon-brand/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categoryList.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    effectiveCategory === category
                      ? "bg-neon-brand text-black"
                      : "bg-white/10 text-[#F9FAFB] hover:bg-white/20"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-neon-brand" />
            </div>
          )}

          {/* Featured Post */}
          {!isLoading && posts.length > 0 && (
            <Link href={`/blog/${posts[0].slug}`}>
              <Card className="bg-gradient-to-br from-neon-brand/10 to-transparent border-neon-brand/20 mb-8 cursor-pointer hover:border-neon-brand/40 transition-all group">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={posts[0].coverImage || "/gallery/sample-1.jpg"}
                      alt={posts[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          "/gallery/sample-1.jpg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-neon-brand text-black text-xs font-bold rounded-full w-fit mb-4">
                      {posts[0].category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#F9FAFB] mb-3 group-hover:text-neon-brand transition-colors">
                      {posts[0].title}
                    </h2>
                    <p className="text-gray-400 mb-4">{posts[0].description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {posts[0].author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {posts[0].publishedAt
                          ? new Date(posts[0].publishedAt).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {posts[0].readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Blog Grid */}
          {!isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post: BlogPost) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="bg-white/5 border-white/10 cursor-pointer hover:border-neon-brand/40 transition-all group h-full">
                    <div className="aspect-video rounded-t-xl overflow-hidden">
                      <img
                        src={post.coverImage || "/gallery/sample-1.jpg"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "/gallery/sample-1.jpg";
                        }}
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <span className="inline-block px-2 py-1 bg-white/10 text-neon-brand text-xs font-medium rounded w-fit mb-2">
                        {post.category}
                      </span>
                      <CardTitle className="text-lg text-[#F9FAFB] group-hover:text-neon-brand transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 mb-4">
                        {post.description}
                      </CardDescription>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "tr-TR"
                              )
                            : "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                Henüz yayınlanmış blog yazısı bulunmuyor.
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-neon-brand/10 to-[#FF2E97]/10 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">
              Hemen AI ile İçerik Oluşturmaya Başlayın
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Blog'da öğrendiklerinizi pratiğe dökün. Ücretsiz kredilerle AI
              araçlarımızı deneyin.
            </p>
            <Link href="/generate">
              <Button className="bg-neon-brand text-black hover:bg-neon-brand/90 font-bold px-8 py-6 text-lg rounded-full">
                Ücretsiz Dene
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
