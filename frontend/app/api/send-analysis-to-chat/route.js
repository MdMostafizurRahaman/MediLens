import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { analysisData } = await request.json()
    
    // Here you would typically send the analysis data to your chat system
    // For now, we'll just return a success response
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analysis sent to chat successfully',
      analysisData 
    })
  } catch (error) {
    console.error('Error sending analysis to chat:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send analysis to chat' },
      { status: 500 }
    )
  }
}