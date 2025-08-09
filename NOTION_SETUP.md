# Setting up your Notion Database for Instagram Grid Preview

To use your own Instagram content with this tool, you need to set up a Notion database with the right structure.

## Database Structure

Create a Notion database with the following properties:

### Required Properties
- **Name** (Title) - The title/caption of your Instagram post
- **Image URL** (URL or Text) - The URL to your image

### Optional Properties
- **Status** (Select) - For managing post status (Draft, Published, etc.)
- **Date** (Date) - When the post was published or scheduled
- **Tags** (Multi-select) - Categories or hashtags

## Property Name Variations

The tool automatically detects image URLs from properties with these names (case-insensitive):
- `Image`
- `Image URL`
- `Photo`
- `URL`

## Supported Image Sources
- Direct image URLs (HTTPS)
- Notion file uploads
- External file services (Unsplash, etc.)

## Example Database Structure

| Name (Title) | Image URL (URL) | Status (Select) | Date (Date) |
|--------------|-----------------|-----------------|-------------|
| "Beautiful sunset" | https://example.com/sunset.jpg | Published | 2024-01-15 |
| "Coffee morning" | https://example.com/coffee.jpg | Draft | 2024-01-16 |

## Tips
1. Make sure your images are publicly accessible URLs
2. Use high-quality, square images for best Instagram grid appearance
3. The tool will show up to 50 most recent posts
4. Images are automatically cached locally for offline viewing
