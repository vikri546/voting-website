import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { name, commentText, similarityRating } = await request.json()

    // Validate the input
    if (!commentText || commentText.trim() === "") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    // Validate similarity rating if provided
    if (
      similarityRating !== undefined &&
      (typeof similarityRating !== "number" || similarityRating < 0 || similarityRating > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid similarity rating. Must be a number between 0 and 100." },
        { status: 400 },
      )
    }

    // Insert the comment into the database
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          name: name || null,
          comment_text: commentText,
          similarity_rating: similarityRating || null,
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting comment:", error)
      return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error processing comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = searchParams.get("sort") || "newest"

    let query = supabase.from("comments").select("*")

    // Apply sorting
    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else {
      // Default to newest first
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
