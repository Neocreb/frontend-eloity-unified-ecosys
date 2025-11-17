import { v4 as uuidv4 } from 'uuid';

// Mock Supabase client for testing
const createMockSupabaseClient = () => {
  return {
    from: (table: string) => ({
      select: (columns: string = '*') => ({
        eq: (column: string, value: string) => {
          console.log(`Mock query: SELECT ${columns} FROM ${table} WHERE ${column} = '${value}'`);
          // Return mock data for the Pioneers group check
          return Promise.resolve({ data: [] as any[], error: null });
        }
      }),
      insert: (data: any) => {
        console.log(`Mock insert into ${table}:`, JSON.stringify(data, null, 2));
        return {
          select: () => ({
            single: () => {
              const mockData = { ...data, id: data.id || uuidv4() };
              return Promise.resolve({ data: mockData, error: null });
            }
          })
        };
      }
    })
  };
};

// Try to import the real Supabase client, fallback to mock if not available
let supabase: any;
let useMock = false;

try {
  // Try to import the module
  const supabaseModule = await import("@/integrations/supabase/client");
  supabase = supabaseModule.supabase;
  
  // Test if the client is properly configured by trying to access a method
  try {
    // This will throw if Supabase is not properly configured
    supabase.from('test');
    console.log("Using real Supabase client");
  } catch (initError) {
    console.log("Supabase client not properly configured, using mock client for testing");
    supabase = createMockSupabaseClient();
    useMock = true;
  }
} catch (importError) {
  console.log("Supabase module not available, using mock client for testing");
  supabase = createMockSupabaseClient();
  useMock = true;
}

async function createPioneersGroup() {
  try {
    console.log("Creating Pioneers group...");
    
    if (useMock) {
      console.log("Note: Using mock Supabase client. In a real environment with proper credentials, this would create the group in your Supabase database.");
      console.log("See SUPABASE_PIONEERS_GROUP_SETUP.md for manual setup instructions.");
      console.log("Alternatively, you can run the SQL script at supabase/create_pioneers_group.sql in your Supabase dashboard.");
    }
    
    // Check if the group already exists
    const { data: existingGroups, error: selectError } = await supabase
      .from('group_chat_threads')
      .select('*')
      .eq('name', 'Pioneers');
      
    if (selectError) {
      console.error("Error checking for existing group:", selectError);
      return;
    }
    
    if (existingGroups && existingGroups.length > 0) {
      console.log("Pioneers group already exists with ID:", (existingGroups[0] as any).id);
      return;
    }
    
    // Create the Pioneers group
    const groupId = uuidv4();
    const insertData = {
      id: groupId,
      name: 'Pioneers',
      description: 'A public group for all pioneers to connect, share ideas, and collaborate. Join us!',
      avatar: '',
      privacy: 'public',
      member_count: 0,
      post_count: 0,
      category: 'community',
      created_by: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for system-created group
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    
    const { data: newGroup, error: insertError } = await supabase
      .from('group_chat_threads')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating Pioneers group:", insertError);
      return;
    }

    console.log("Successfully created Pioneers group with ID:", (newGroup as any).id);
    
    // Also create an initial welcome message
    const messageData = {
      id: uuidv4(),
      thread_id: (newGroup as any).id,
      sender_id: '00000000-0000-0000-0000-000000000000', // Placeholder for system sender
      content: 'Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate.',
      type: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: messageError } = await supabase
      .from('group_messages')
      .insert(messageData);

    if (messageError) {
      console.error("Error creating welcome message:", messageError);
    } else {
      console.log("Successfully created welcome message");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the function
createPioneersGroup();