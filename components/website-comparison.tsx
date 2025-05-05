"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, ThumbsUp, X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { CommentsSection } from "@/components/comments-section"

interface Website {
  id: number
  name: string
  url: string
  image_url: string
  description: string
}

export function WebsiteComparison() {
  const { toast } = useToast()
  const [similarity, setSimilarity] = useState(50)
  const [voted, setVoted] = useState(false)
  const [totalVotes, setTotalVotes] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [showFullImage, setShowFullImage] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // Load websites and voting statistics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Seed the database with the new URLs and image paths
        await fetch("/api/seed")

        // Fetch websites
        const websitesResponse = await fetch("/api/websites")
        const websitesData = await websitesResponse.json()

        // Fetch voting statistics
        const statsResponse = await fetch("/api/votes")
        const statsData = await statsResponse.json()

        setWebsites(websitesData)
        setTotalVotes(statsData.totalVotes)
        setAverageRating(statsData.averageRating)

        // Check if user has voted (using session storage for UX)
        const hasVoted = sessionStorage.getItem("voted") === "true"
        setVoted(hasVoted)

        if (hasVoted) {
          const userRating = Number.parseInt(sessionStorage.getItem("userRating") || "50")
          setSimilarity(userRating)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleVote = async () => {
    try {
      // Submit vote to API
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ similarityRating: similarity }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit vote")
      }

      // Update local state
      setVoted(true)

      // Store in session storage for UX
      sessionStorage.setItem("voted", "true")
      sessionStorage.setItem("userRating", similarity.toString())

      // Refresh statistics
      const statsResponse = await fetch("/api/votes")
      const statsData = await statsResponse.json()

      setTotalVotes(statsData.totalVotes)
      setAverageRating(statsData.averageRating)

      toast({
        title: "Thank you for voting!",
        description: `You rated the similarity as ${similarity}%`,
      })

      // Show comments section after voting
      setShowComments(true)
    } catch (error) {
      console.error("Error submitting vote:", error)
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetVote = () => {
    setVoted(false)
    sessionStorage.removeItem("voted")
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
          <p className="text-slate-600 dark:text-slate-400">Harap Bersabar...</p>
        </div>
      </div>
    )
  }

  const originalWebsite = websites.find((w) => w.name === "Original Website") || {
    id: 1,
    name: "Original Website",
    url: "https://dtalk.aconymous.com/",
    image_url: "/images/original-website.png",
    description: "This is the original dtalk website created by another party.",
  }

  const recreationWebsite = websites.find((w) => w.name === "Our Recreation") || {
    id: 2,
    name: "Our Recreation",
    url: "https://dtalk-aconymous.vercel.app/",
    image_url: "/images/recreation-website.png",
    description: "This is our recreation attempting to match the original dtalk website's design and functionality.",
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <WebsiteCard
          title={originalWebsite.name}
          imageSrc={originalWebsite.image_url}
          websiteUrl={originalWebsite.url}
          description={originalWebsite.description}
          onImageClick={() => setShowFullImage(true)}
        />

        <WebsiteCard
          title={recreationWebsite.name}
          imageSrc={recreationWebsite.image_url}
          websiteUrl={recreationWebsite.url}
          description={recreationWebsite.description}
        />
      </div>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="text-center">Seberapa mirip dengan website diatas?</CardTitle>
        </CardHeader>
        <CardContent>
          {!voted ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Not similar but its okelah ya</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{similarity}%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Perfect, Amazing, Beautifuly</span>
              </div>

              <Slider
                value={[similarity]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setSimilarity(value[0])}
                className="py-4"
              />

              <Button
                onClick={handleVote}
                className="mx-auto mt-4 flex w-full items-center justify-center gap-2 md:w-1/2"
              >
                <ThumbsUp className="h-4 w-4" />
                Submit Your Vote
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium">Thank you for voting!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You rated the similarity as{" "}
                  <span className="font-bold text-slate-900 dark:text-slate-50">{similarity}%</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Community Rating</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {averageRating.toFixed(1)}% similarity
                  </span>
                </div>
                <Progress value={averageRating} className="h-2" />
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Based on {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={resetVote}
                className="mx-auto mt-4 flex w-full items-center justify-center gap-2 md:w-1/2"
              >
                Vote Again
              </Button>

              {!showComments && (
                <Button
                  onClick={() => setShowComments(true)}
                  variant="secondary"
                  className="mx-auto mt-2 flex w-full items-center justify-center gap-2 md:w-1/2"
                >
                  Leave Detailed Feedback
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Help us improve our website recreation by providing your feedback.
        </CardFooter>
      </Card>

      {showComments && (
        <div className="mt-8">
          <CommentsSection currentRating={voted ? similarity : undefined} />
        </div>
      )}

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogOverlay className="bg-black/80" />
        <DialogContent className="max-w-4xl border-none bg-transparent shadow-none">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-0 z-10 rounded-full bg-white/90"
              onClick={() => setShowFullImage(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <Image
              src="/images/original-website-full.jpeg"
              alt="Full view of original website"
              width={1200}
              height={800}
              className="rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface WebsiteCardProps {
  title: string
  imageSrc: string
  websiteUrl: string
  description: string
  onImageClick?: () => void
}

function WebsiteCard({ title, imageSrc, websiteUrl, description, onImageClick }: WebsiteCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Link
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
          >
            Visit Website <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div
          className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800"
          onClick={onImageClick}
          style={{ cursor: onImageClick ? "pointer" : "default" }}
        >
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={`Screenshot of ${title}`}
            width={600}
            height={400}
            className="h-auto w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        {title === "Original Website" && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">(Click image to see full website view)</p>
        )}
      </CardContent>
    </Card>
  )
}
