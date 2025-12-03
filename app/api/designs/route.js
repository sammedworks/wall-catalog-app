import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/designs - List all designs with filters, search, pagination
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status'); // draft, published, archived
    const category = searchParams.get('category');
    const areaType = searchParams.get('area_type');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const style = searchParams.get('style');
    const level = searchParams.get('level');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Build query
    let query = supabase
      .from('designs')
      .select(`
        *,
        category:design_categories(id, name, slug, color_code),
        area_type:area_types(id, name, slug),
        tags:design_tag_relations(
          tag:design_tags(id, name, slug, color_code, tag_group)
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (areaType) {
      query = query.eq('area_type_id', areaType);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,short_description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('starting_price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('starting_price', parseFloat(maxPrice));
    }

    if (style) {
      query = query.eq('style', style);
    }

    if (level) {
      query = query.eq('level', level);
    }

    // Tag filtering (if tags provided)
    if (tags && tags.length > 0) {
      const { data: designsWithTags } = await supabase
        .from('design_tag_relations')
        .select('design_id')
        .in('tag_id', tags);

      if (designsWithTags && designsWithTags.length > 0) {
        const designIds = designsWithTags.map(d => d.design_id);
        query = query.in('id', designIds);
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    });

  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/designs - Create new design
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Generate slug from title if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Set created_by
    body.created_by = user.id;
    body.updated_by = user.id;

    // Extract tags if provided
    const tags = body.tags || [];
    delete body.tags;

    // Insert design
    const { data: design, error: designError } = await supabase
      .from('designs')
      .insert([body])
      .select()
      .single();

    if (designError) throw designError;

    // Insert tag relations
    if (tags.length > 0) {
      const tagRelations = tags.map(tagId => ({
        design_id: design.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('design_tag_relations')
        .insert(tagRelations);

      if (tagError) console.error('Error inserting tags:', tagError);
    }

    // Log activity
    await supabase.from('design_activity_log').insert([{
      design_id: design.id,
      action: 'created',
      action_by: user.id,
      action_by_email: user.email
    }]);

    return NextResponse.json({
      success: true,
      data: design,
      message: 'Design created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating design:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
