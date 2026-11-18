"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { api } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPostItem } from "@/types";

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: post, isPending, isError } = useQuery<BlogPostItem>({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const res = await api.get(`/blogs/${slug}`);
      return res.data.data;
    },
    enabled: Boolean(slug),
  });

  if (isPending) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <p className="text-sm text-muted-foreground">
          The medical briefing you requested could not be found.
        </p>
        <Link href="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const blocks = post.content.split("\n\n").filter(Boolean);

  return (
    <article className="min-h-screen bg-background text-foreground pb-16">
      <div className="border-b border-border/70 bg-muted/25">
        <div className="container mx-auto px-4 md:px-6 py-4 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clinical Blog
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-4xl space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge>{post.category}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-foreground">
            {post.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">{post.authorRole}</p>
            </div>
          </div>
        </header>

        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border shadow-sm">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="space-y-5 text-sm sm:text-base leading-relaxed text-foreground/90">
          {blocks.map((block, idx) => {
            if (block.startsWith("### ")) {
              return (
                <h2 key={idx} className="text-xl font-bold text-foreground pt-4">
                  {block.replace("### ", "")}
                </h2>
              );
            }
            if (block.includes("\n- ") || block.startsWith("- ")) {
              const items = block.split("\n").filter((l) => l.trim().startsWith("- "));
              return (
                <ul key={idx} className="list-disc pl-6 space-y-2 text-muted-foreground">
                  {items.map((line, i) => (
                    <li key={i}>{line.replace(/^- /, "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-muted-foreground whitespace-pre-line">
                {block}
              </p>
            );
          })}
        </div>

        {post.related && post.related.length > 0 && (
          <section className="pt-10 border-t border-border/80 space-y-5">
            <h2 className="text-xl font-bold text-foreground">Related Safety Briefings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {post.related.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block">
                  <Card className="h-full rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors">
                    <CardContent className="p-4 space-y-2">
                      <Badge variant="secondary" className="text-[11px]">
                        {rel.category}
                      </Badge>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{rel.readTime}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
