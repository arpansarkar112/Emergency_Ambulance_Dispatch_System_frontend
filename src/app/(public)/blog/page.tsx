"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogs } from "@/hooks/use-fleet";
import { useDebounce } from "@/hooks/use-debounce";

const CATEGORIES = ["ALL", "Critical Care", "Triage Guide", "Dispatch Operations", "Preparedness"];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isPending } = useBlogs({
    search: debouncedSearch || undefined,
    category,
    limit: 12,
  });

  const posts = data?.posts || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30">
            Clinical Journal & Emergency Preparedness
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Emergency Medical Blog & Safety Guides
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Written by our emergency physicians and frontline paramedics to help families,
            caregivers, and clinic staff navigate acute medical emergencies with clarity.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-10 space-y-8">
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Label htmlFor="blog-search" className="sr-only">
              Search medical articles
            </Label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="blog-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search safety guides, cardiac care, triage..."
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
              >
                {cat === "ALL" ? "All Topics" : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold">No articles match your filter</h2>
            <p className="text-sm text-muted-foreground">
              Try another keyword or switch back to all clinical topics.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("ALL");
              }}
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <Card className="h-full flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden py-0 gap-0 hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{post.authorName}</p>
                        <p className="text-muted-foreground">{post.authorRole}</p>
                      </div>
                      <span className="text-primary font-semibold inline-flex items-center gap-1">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
