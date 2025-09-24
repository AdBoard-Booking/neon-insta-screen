import { NextResponse } from 'next/server';
import { getApprovedSubmissions } from '@/lib/airtable';

export async function GET() {
  try {
    const submissions = await getApprovedSubmissions();
    
    return NextResponse.json({
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching approved submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approved submissions' },
      { status: 500 }
    );
  }
}