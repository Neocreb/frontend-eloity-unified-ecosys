# Create Group With Participants Function

This Supabase edge function creates a group chat with participants in a single atomic operation.

## Functionality

- Creates a new group chat thread
- Adds the creator as an admin
- Adds all specified participants with appropriate roles
- Handles error cases with proper cleanup
- Returns the created group information

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL (automatically available in Supabase Edge environment)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (automatically available in Supabase Edge environment)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for full database access (automatically available in Supabase Edge environment)

## Deployment

```bash
supabase functions deploy create-group-with-participants
```

## Setup

To use this function, you need to:

1. Deploy the function to your Supabase project
2. Set the `VITE_USE_GROUP_FUNCTION=true` environment variable in your frontend to enable the function endpoint
3. Ensure your Supabase URL is properly configured in `VITE_SUPABASE_URL`

## API Endpoint

```
POST https://your-project.supabase.co/functions/v1/create-group-with-participants
```

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Group Name",
  "description": "Group description",
  "avatar": "https://example.com/avatar.jpg",
  "participants": ["user-uuid-1", "user-uuid-2", ...],
  "settings": {
    "isPrivate": false,
    "whoCanSendMessages": "everyone",
    "whoCanAddMembers": "admins_only",
    "whoCanEditGroupInfo": "admins_only",
    "whoCanRemoveMembers": "admins_only"
  }
}
```

### Response

```json
{
  "success": true,
  "group": {
    "id": "group-uuid",
    "name": "Group Name",
    "description": "Group description",
    "avatar": "https://example.com/avatar.jpg",
    "privacy": "public",
    "member_count": 3,
    "created_by": "user-uuid",
    "created_at": "2025-11-17T14:30:00Z",
    "last_activity": "2025-11-17T14:30:00Z"
  }
}
```

## Error Handling

The function will return appropriate HTTP status codes and error messages for various failure scenarios:

- 400: Bad Request (missing required fields, invalid data)
- 401: Unauthorized (missing or invalid token)
- 405: Method Not Allowed (non-POST requests)
- 500: Internal Server Error (database errors, etc.)

## Local Development

To test locally:

1. Make sure you have the Supabase CLI installed
2. Link your project: `supabase link`
3. Start the local development server: `supabase functions serve`
4. The function will be available at `http://localhost:54321/functions/v1/create-group-with-participants`