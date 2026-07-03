import { NextResponse } from 'next/server';
import { fetchPublicListingsData } from '@/lib/publicListings';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const subcategoryTag = searchParams.get('subcategoryTag');

  if (!subcategoryTag) {
    return NextResponse.json({ error: 'subcategoryTag is required' }, { status: 400 });
  }

  try {
    const listings = await fetchPublicListingsData({ subcategoryTag });

    return NextResponse.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
