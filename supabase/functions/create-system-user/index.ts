
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  full_name: string;
  email: string;
  role: 'admin' | 'warehouse' | 'customer';
  username?: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user: requestingUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !requestingUser) {
      throw new Error('Invalid authentication')
    }

    // Check if requesting user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Insufficient permissions - admin role required')
    }

    // Parse the request body
    const userData: CreateUserRequest = await req.json()

    // Create the user account with Supabase Auth Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
        username: userData.username
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // Update the user's profile with the role
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: userData.role,
        full_name: userData.full_name,
        email: userData.email
      })
      .eq('id', authData.user.id)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      throw new Error('Failed to update user profile')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user,
        message: `System user ${userData.full_name} created successfully`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating system user:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create system user',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
