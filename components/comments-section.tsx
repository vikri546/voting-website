"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CommentForm } from "@/components/comment-form"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface Comment {
  id: number
  name: string | null
  comment_text: string
  similarity_rating: number | null
  created_at: string
}

export function CommentsSection({ currentRating }: { currentRating?: number }) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [showForm, setShowForm] = useState(false)

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?sort=${sortOrder}`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder])

  const handleCommentAdded = () => {
    fetchComments()
    setShowForm(false)
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback Comments
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchComments} title="Refresh comments">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full">
            Leave Feedback
          </Button>
        ) : (
          <div className="mb-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-4 text-lg font-medium">Share Your Feedback</h3>
            <CommentForm onCommentAdded={handleCommentAdded} currentRating={currentRating} />
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
              <p className="text-sm text-slate-500">Loading comments...</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No comments yet. Be the first to leave feedback!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">{comment.name || "Anonymous"}</h3>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{comment.comment_text}</p>

                {comment.similarity_rating !== null && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Similarity Rating</span>
                      <span className="font-medium">{comment.similarity_rating}%</span>
                    </div>
                    <Progress value={comment.similarity_rating} className="h-1.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-slate-800">
        {comments.length > 0 && `Showing ${comments.length} ${comments.length === 1 ? "comment" : "comments"}`}
      </CardFooter>
    </Card>
  )
}
