import { NextRequest, NextResponse } from 'next/server'

interface EnrichRequest {
  url: string
}

interface EnrichResponse {
  title?: string
  description?: string
  suggestedTag?: string
  favicon?: string
  error?: string
}

async function extractMetadata(url: string): Promise<Partial<EnrichResponse>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      return {}
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    // Extract description from meta tags
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : undefined

    // Extract og:image if available
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)

    return {
      title,
      description,
      favicon: ogImageMatch ? ogImageMatch[1] : undefined,
    }
  } catch (error) {
    console.error(`Error extracting metadata from ${url}:`, error)
    return {}
  }
}

/**
 * POST /api/enrich
 * Server-side metadata extraction from a URL.
 * Request: { url: string }
 * Response: { title?, description?, suggestedTag?, favicon?, error? }
 */
export async function POST(request: NextRequest): Promise<NextResponse<EnrichResponse>> {
  try {
    const body: EnrichRequest = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'url is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Extract metadata
    const metadata = await extractMetadata(url)

    // TODO: Integrate Gemini API for AI-generated suggestions if needed
    // const geminiKey = process.env.GEMINI_API_KEY
    // if (geminiKey && metadata.title) {
    //   const suggestedTag = await callGeminiForTag(url, metadata.title, geminiKey)
    //   metadata.suggestedTag = suggestedTag
    // }

    return NextResponse.json(
      {
        title: metadata.title || 'Untitled',
        description: metadata.description || 'No description available',
        suggestedTag: 'Article',
        favicon: metadata.favicon,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in /api/enrich:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Optional: Server-side Gemini wrapper (currently stubbed)
 * Uncomment and implement when ready to enable AI tagging
 */
// async function callGeminiForTag(
//   url: string,
//   title: string,
//   apiKey: string
// ): Promise<string> {
//   try {
//     const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-pro:generateContent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-goog-api-key': apiKey,
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: `Given this webpage title: "${title}" from URL: "${url}", suggest a single relevant tag category (max 2 words). Return only the tag.`,
//               },
//             ],
//           },
//         ],
//       }),
//     })

//     if (!response.ok) {
//       return 'Article'
//     }

//     const data = await response.json()
//     const suggestedTag = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Article'
//     return suggestedTag.trim()
//   } catch (error) {
//     console.error('Error calling Gemini:', error)
//     return 'Article'
//   }
// }
