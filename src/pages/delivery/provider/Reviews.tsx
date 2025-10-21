import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOutletContext } from 'react-router-dom';
import { Star, MessageSquare, User, Calendar, ThumbsUp } from 'lucide-react';

export default function Reviews() {
  const { ratings, stats } = useOutletContext() as any;

  const getRatingColor = (rating: number) => {
    if (rating === 5) return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (rating === 4) return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    if (rating === 3) return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating === 5) return 'bg-green-600 text-white';
    if (rating === 4) return 'bg-blue-600 text-white';
    if (rating === 3) return 'bg-yellow-600 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
      </div>

      {/* Overall Rating Summary */}
      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(stats.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats.rating}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Out of 5 stars</p>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 dark:bg-yellow-500 rounded-full"
                      style={{ width: `${(Math.random() * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 20)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{ratings.length}+</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Positive Feedback</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Math.round((ratings.filter((r: any) => r.rating >= 4).length / ratings.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ratings.length > 0 ? (
            ratings.map((review: any) => (
              <div
                key={review.id}
                className={`p-5 rounded-lg border-2 ${getRatingColor(review.rating)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{review.customerName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Order #{review.orderNumber}</p>
                    </div>
                  </div>
                  <Badge className={getRatingBadgeColor(review.rating)}>
                    {review.rating}★
                  </Badge>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">"{review.comment}"</p>

                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.deliveryDate).toLocaleDateString()}
                    </span>
                    <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                      <ThumbsUp className="h-3 w-3" />
                      Helpful
                    </button>
                  </div>
                  {review.rating === 5 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                      ⭐ Exceptional
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No reviews yet. Complete deliveries to receive customer reviews.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips to Improve Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Tips to Improve Your Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Be Punctual</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">Arrive on time for pickups and deliveries. This is one of the top factors customers rate.</p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-l-4 border-green-500">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-1">Handle with Care</p>
            <p className="text-sm text-green-800 dark:text-green-200">Treat packages with respect. Customers appreciate when their items arrive in perfect condition.</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Communicate Clearly</p>
            <p className="text-sm text-purple-800 dark:text-purple-200">Keep customers updated on delivery status. Quick responses build trust and confidence.</p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border-l-4 border-yellow-500">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Professional Appearance</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">Maintain a professional appearance. First impressions matter to customers.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
