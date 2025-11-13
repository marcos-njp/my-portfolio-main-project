import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

console.log('Testing Neon connection...');

try {
  // Check table structure
  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'ChatLog' 
    ORDER BY ordinal_position
  `;
  
  console.log('\n📋 ChatLog table structure:');
  console.log(JSON.stringify(columns, null, 2));
  
  // Try a test INSERT
  console.log('\n🔵 Testing INSERT...');
  const result = await sql`
    INSERT INTO "ChatLog" (
      id,
      "sessionId",
      "userQuery",
      "aiResponse",
      mood,
      "chunksUsed",
      "topScore",
      "avgScore",
      timestamp
    ) VALUES (
      gen_random_uuid(),
      'test_session_123',
      'Test query from script',
      'Test response from script',
      'professional',
      4,
      0.85,
      0.82,
      NOW()
    )
    RETURNING id, "sessionId", timestamp
  `;
  
  console.log('\n✅ INSERT successful!');
  console.log(JSON.stringify(result, null, 2));
  
} catch (error) {
  console.error('\n❌ Error:', error);
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
}
