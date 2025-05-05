import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { similarityRating } = await request.json()

    // Validate the input
    if (typeof similarityRating !== "number" || similarityRating < 0 || similarityRating > 100) {
      return NextResponse.json(
        { error: "Invalid similarity rating. Must be a number between 0 and 100." },
        { status: 400 },
      )
    }

    // Get the IP address from the request
    const ip = request.headers.get("x-forwarded-for") || "unknown"

    // Insert the vote into the database
    const { data, error } = await supabase
      .from("votes")
      .insert([{ similarity_rating: similarityRating, ip_address: ip }])
      .select()

    if (error) {
      console.error("Error inserting vote:", error)
      return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error processing vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get the total number of votes
    const { count: totalVotes, error: countError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error getting vote count:", countError)
      return NextResponse.json({ error: "Failed to get vote statistics" }, { status: 500 })
    }

    // Get the average similarity rating
    const { data: avgData, error: avgError } = await supabase
      .from("votes")
      .select("similarity_rating")
      .then((result) => {
        if (result.error) throw result.error

        // Calculate the average manually
        const sum = result.data.reduce((acc, vote) => acc + vote.similarity_rating, 0)
        const avg = result.data.length > 0 ? sum / result.data.length : 0

        return { data: { average: avg }, error: null }
      })

    if (avgError) {
      console.error("Error getting average rating:", avgError)
      return NextResponse.json({ error: "Failed to get vote statistics" }, { status: 500 })
    }

    return NextResponse.json({
      totalVotes: totalVotes || 0,
      averageRating: avgData.average || 0,
    })
  } catch (error) {
    console.error("Error getting vote statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
