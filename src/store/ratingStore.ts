import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Review {
  id: string;
  freelancerId: string;
  clientId: string;
  orderId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

interface RatingState {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  getReviewsByFreelancer: (freelancerId: string) => Review[];
  getAverageRating: (freelancerId: string) => number;
}

export const useRatingStore = create<RatingState>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: `review_${Date.now()}`,
          createdAt: new Date(),
        };

        set((state) => ({
          reviews: [...state.reviews, newReview],
        }));
      },

      getReviewsByFreelancer: (freelancerId: string) => {
        return get().reviews.filter((r) => r.freelancerId === freelancerId);
      },

      getAverageRating: (freelancerId: string) => {
        const freelancerReviews = get().reviews.filter((r) => r.freelancerId === freelancerId);
        if (freelancerReviews.length === 0) return 0;

        const sum = freelancerReviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / freelancerReviews.length;
      },
    }),
    {
      name: "rating-store",
    }
  )
);
