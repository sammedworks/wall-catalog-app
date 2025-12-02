import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase environment variables not configured',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database connection and check tables
    const checks = {
      connection: false,
      tables: {},
      data: {},
      rls: {}
    };

    // Check materials table
    try {
      const { data, error, count } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: false })
        .eq('is_active', true);
      
      checks.tables.materials = !error;
      checks.data.materials = count || 0;
      checks.rls.materials = error ? error.message : 'OK';
    } catch (e) {
      checks.tables.materials = false;
      checks.rls.materials = e.message;
    }

    // Check design_tags table
    try {
      const { data, error, count } = await supabase
        .from('design_tags')
        .select('*', { count: 'exact', head: false })
        .eq('is_active', true);
      
      checks.tables.design_tags = !error;
      checks.data.design_tags = count || 0;
      checks.rls.design_tags = error ? error.message : 'OK';
    } catch (e) {
      checks.tables.design_tags = false;
      checks.rls.design_tags = e.message;
    }

    // Check designs table
    try {
      const { data, error, count } = await supabase
        .from('designs')
        .select('*', { count: 'exact', head: false })
        .eq('is_active', true);
      
      checks.tables.designs = !error;
      checks.data.designs = count || 0;
      checks.rls.designs = error ? error.message : 'OK';
    } catch (e) {
      checks.tables.designs = false;
      checks.rls.designs = e.message;
    }

    // Check products table (legacy)
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: false })
        .eq('is_active', true);
      
      checks.tables.products = !error;
      checks.data.products = count || 0;
      checks.rls.products = error ? error.message : 'OK';
    } catch (e) {
      checks.tables.products = false;
      checks.rls.products = e.message;
    }

    // Check user_profiles table
    try {
      const { data, error, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      checks.tables.user_profiles = !error;
      checks.data.user_profiles = count || 0;
      checks.rls.user_profiles = error ? error.message : 'OK';
    } catch (e) {
      checks.tables.user_profiles = false;
      checks.rls.user_profiles = e.message;
    }

    checks.connection = true;

    // Determine overall status
    const allTablesExist = Object.values(checks.tables).every(v => v === true);
    const hasData = checks.data.materials > 0 && checks.data.design_tags > 0;
    
    let status = 'healthy';
    let message = 'All systems operational';
    let recommendations = [];

    if (!allTablesExist) {
      status = 'error';
      message = 'Some database tables are missing';
      recommendations.push('Run database/COMPLETE_SCHEMA.sql in Supabase SQL Editor');
    } else if (!hasData) {
      status = 'warning';
      message = 'Database tables exist but missing data';
      recommendations.push('Run database/COMPLETE_SCHEMA.sql to insert sample data');
      recommendations.push('Or create materials and tags in admin panel');
    } else if (checks.data.designs === 0 && checks.data.products === 0) {
      status = 'warning';
      message = 'No designs found';
      recommendations.push('Create designs in admin panel at /admin/products');
    }

    return NextResponse.json({
      status,
      message,
      timestamp: new Date().toISOString(),
      checks,
      recommendations,
      summary: {
        totalMaterials: checks.data.materials || 0,
        totalTags: checks.data.design_tags || 0,
        totalDesigns: checks.data.designs || 0,
        totalProducts: checks.data.products || 0,
        totalUsers: checks.data.user_profiles || 0
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
