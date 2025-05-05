"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CommentFormProps {
  onCommentAdded: () => void
  currentRating?: number
}

export function CommentForm({ onCommentAdded, currentRating }: CommentFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || null,
          commentText: comment.trim(),
          similarityRating: currentRating,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit comment")
      }

      toast({
        title: "Comment submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setName("")
      setComment("")

      // Notify parent component
      onCommentAdded()
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to submit your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-sm font-medium">
          Name (optional)
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="comment" className="text-sm font-medium">
          Your Feedback
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Berikan saran dan masukan kalian wok..."
          className="mt-1 min-h-[100px]"
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}
