import { NextResponse } from "next/server"

const PAPERCLIP_URL = process.env.PAPERCLIP_API_URL || "http://127.0.0.1:3100/api"
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || ""

export async function GET() {
  try {
    const res = await fetch(`${PAPERCLIP_URL}/companies/${COMPANY_ID}/projects`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch projects from Paperclip" },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Paperclip API unavailable", detail: String(error) },
      { status: 502 },
    )
  }
}
