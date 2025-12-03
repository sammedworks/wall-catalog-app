import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/designs/[id] - Get single design with full details
export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Fetch design with relations
    const { data: design, error } = await supabase
      .from('designs')
      .select(`
        *,
        category:design_categories(id, name, slug, color_code, icon),
        area_type:area_types(id, name, slug, icon),
        tags:design_tag_relations(
          tag:design_tags(id, name, slug, color_code, tag_group)
        ),
        media:design_media(
          id, file_name, file_url, file_type, thumbnail_url, 
          medium_url, large_url, alt_text, caption, is_primary, display_order
        ),
        products:design_product_relations(
          id, product_id, product_type, quantity, 
          position_metadata, is_optional, override_price
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!design) {
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    // Increment view count (async, don't wait)
    supabase.rpc('increment_design_views', { design_uuid: id }).then();

    return NextResponse.json({
      success: true,
      data: design
    });

  } catch (error) {
    console.error('Error fetching design:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/designs/[id] - Update design
export async function PUT(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Get existing design for change tracking
    const { data: existingDesign } = await supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingDesign) {
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    // Set updated_by
    body.updated_by = user.id;

    // Handle tags separately
    const tags = body.tags;
    delete body.tags;

    // Update design
    const { data: design, error: updateError } = await supabase
      .from('designs')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tag relations
      await supabase
        .from('design_tag_relations')
        .delete()
        .eq('design_id', id);

      // Insert new tag relations
      if (tags.length > 0) {
        const tagRelations = tags.map(tagId => ({
          design_id: id,
          tag_id: tagId
        }));

        await supabase
          .from('design_tag_relations')
          .insert(tagRelations);
      }
    }

    // Track changes for activity log
    const changes = {};
    Object.keys(body).forEach(key => {
      if (existingDesign[key] !== body[key]) {
        changes[key] = {
          from: existingDesign[key],
          to: body[key]
        };
      }
    });

    // Log activity
    await supabase.from('design_activity_log').insert([{
      design_id: id,
      action: 'updated',
      action_by: user.id,
      action_by_email: user.email,
      changes
    }]);

    return NextResponse.json({
      success: true,
      data: design,
      message: 'Design updated successfully'
    });

  } catch (error) {
    console.error('Error updating design:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/designs/[id] - Delete design
export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if design exists
    const { data: existingDesign } = await supabase
      .from('designs')
      .select('title')
      .eq('id', id)
      .single();

    if (!existingDesign) {
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    // Log activity before deletion
    await supabase.from('design_activity_log').insert([{
      design_id: id,
      action: 'deleted',
      action_by: user.id,
      action_by_email: user.email,
      changes: { title: existingDesign.title }
    }]);

    // Delete design (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('designs')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Design deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting design:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
