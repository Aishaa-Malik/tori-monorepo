import { NextResponse } from 'next/server';
import { fetchPublicListingsData } from '@/lib/publicListings';

export async function GET(_request, { params }) {
  const { serviceId } = await params;

  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
  }

  try {
    const listing = await fetchPublicListingsData({ serviceId });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}
