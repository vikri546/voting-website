import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Get all websites
    const { data, error } = await supabase.from("websites").select("*").order("id", { ascending: true })

    if (error) {
      console.error("Error fetching websites:", error)
      return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching websites:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
