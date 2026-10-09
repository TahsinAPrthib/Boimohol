// Mean of a book's review ratings; 0 when it has none (StarRating shows empty).
export function averageOf(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
