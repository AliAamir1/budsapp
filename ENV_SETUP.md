# Environment Setup

## Required Environment Variables

Create a `.env` file in the root of your project with the following content:

```bash
# API Configuration - Replace with your actual backend URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Optional: If using Supabase in the future
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Important Notes

1. **Replace the URL**: Change `http://localhost:3000` to your actual backend API URL
2. **Restart the development server** after creating/modifying the `.env` file
3. **Environment variables must start with `EXPO_PUBLIC_`** to be accessible in the client-side code
4. **Do not commit the `.env` file** to version control (it should already be in `.gitignore`)

## Testing the Setup

You can test if the environment variable is correctly loaded by checking the logs when the app starts. The API client will throw an error if `EXPO_PUBLIC_API_BASE_URL` is not set.