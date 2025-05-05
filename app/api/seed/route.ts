import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Update the websites table with the new URLs and image paths
    const { data, error } = await supabase
      .from("websites")
      .upsert([
        {
          id: 1,
          name: "Original Website",
          url: "https://dtalk.aconymous.com/",
          image_url: "/images/original-website.png",
          description: "This is the original dtalk website created by another party.",
        },
        {
          id: 2,
          name: "Our Recreation",
          url: "https://dtalk-aconymous.vercel.app/",
          image_url: "/images/recreation-website.png",
          description:
            "This is our recreation attempting to match the original dtalk website's design and functionality.",
        },
      ])
      .select()

    if (error) {
      console.error("Error updating websites:", error)
      return NextResponse.json({ error: "Failed to update websites" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
