"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  AmbulanceItem,
  BlogPostItem,
  CategoryItem,
  PublicStats,
  ReviewItem,
} from "@/types";

export interface FleetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  categoryId?: string;
  status?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minRating?: string | number;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FleetListResponse {
  ambulances: AmbulanceItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePublicFleet(params: FleetQueryParams = {}) {
  return useQuery<FleetListResponse>({
    queryKey: ["public-fleet", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
      if (params.search) searchParams.set("search", params.search);
      if (params.type && params.type !== "ALL") searchParams.set("type", params.type);
      if (params.categoryId && params.categoryId !== "ALL")
        searchParams.set("categoryId", params.categoryId);
      if (params.status && params.status !== "ALL") searchParams.set("status", params.status);
      if (params.minPrice !== undefined && params.minPrice !== "")
        searchParams.set("minPrice", String(params.minPrice));
      if (params.maxPrice !== undefined && params.maxPrice !== "")
        searchParams.set("maxPrice", String(params.maxPrice));
      if (params.minRating !== undefined && params.minRating !== "")
        searchParams.set("minRating", String(params.minRating));
      if (params.featured) searchParams.set("featured", "true");
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const res = await api.get(`/ambulances/public?${searchParams.toString()}`);
      return res.data.data;
    },
    staleTime: 30_000,
  });
}

export function usePublicAmbulanceDetail(id: string) {
  return useQuery<AmbulanceItem>({
    queryKey: ["public-ambulance", id],
    queryFn: async () => {
      const res = await api.get(`/ambulances/public/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await api.get("/public/stats");
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
    staleTime: 60_000,
  });
}

export function useRecentReviews(limit = 6) {
  return useQuery<ReviewItem[]>({
    queryKey: ["recent-reviews", limit],
    queryFn: async () => {
      const res = await api.get(`/public/reviews?limit=${limit}`);
      return res.data.data || [];
    },
    staleTime: 60_000,
  });
}

export function useBlogs(params?: { search?: string; category?: string; page?: number; limit?: number }) {
  return useQuery<{ posts: BlogPostItem[]; total: number; page: number; totalPages: number }>({
    queryKey: ["blogs", params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set("page", String(params.page));
      if (params?.limit) sp.set("limit", String(params.limit));
      if (params?.search) sp.set("search", params.search);
      if (params?.category && params.category !== "ALL") sp.set("category", params.category);
      const res = await api.get(`/blogs?${sp.toString()}`);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}
