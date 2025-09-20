# 🎭 Duet Feature - Complete Implementation Guide

The Duet feature allows users to create collaborative videos by recording alongside existing videos. This implementation provides a complete TikTok-style duet system with real-time recording, video merging, and advanced audio mixing.

## 🌟 Features

### Core Duet Functionality
- **Real-time Video Recording**: Synchronized recording with original video playback
- **Multiple Duet Styles**: Side-by-side, React & Respond, Picture-in-Picture
- **Advanced Audio Mixing**: Original audio, voiceover only, or both combined
- **Automatic Video Merging**: Client-side video processing and merging
- **Duet Chain Tracking**: Track and display all duets of a video
- **Performance Analytics**: Detailed statistics on duet engagement

### Video Features
- **Synchronized Playback**: Original and user video perfectly synced
- **Variable Volume Control**: Independent volume controls for each audio source
- **High-Quality Recording**: Support for HD video recording (720p/1080p)
- **Multiple Format Support**: WebM, MP4 output formats
- **Auto-duration Matching**: User recording automatically matches original video length

### Social Features
- **Auto-captioning**: Generates "Duet with @username" captions
- **Smart Tagging**: Automatic hashtag suggestions based on duet style
- **Creator Attribution**: Links back to original creator with proper credit
- **Engagement Tracking**: Likes, comments, shares, and tips on duets
- **Duet Discovery**: Browse and explore duet chains

## 🏗️ Architecture

### Database Schema

New fields added to the `posts` table:

```sql
-- Duet metadata fields
is_duet BOOLEAN DEFAULT FALSE,
duet_of_post_id UUID REFERENCES posts(id),
original_creator_id UUID REFERENCES users(id),
original_creator_username TEXT,
duet_style TEXT CHECK (duet_style IN ('side-by-side', 'react-respond', 'picture-in-picture')),
audio_source TEXT DEFAULT 'both' CHECK (audio_source IN ('original', 'both', 'voiceover')),
duet_video_url TEXT,
original_video_url TEXT
```

### Backend API Endpoints

```
GET    /api/duets/original/:postId     - Get original video data for duet creation
POST   /api/duets/create              - Create a new duet video
GET    /api/duets/chain/:postId       - Get duet chain for a post
GET    /api/duets/user/:userId        - Get all duets created by a user
DELETE /api/duets/:postId             - Delete a duet post
GET    /api/duets/stats/:postId       - Get duet statistics for a post
```

### Frontend Components

```
src/components/video/
├── DuetRecorder.tsx                  - Main duet recording interface
├── DuetEnabledVideoPlayer.tsx        - Enhanced video player with duet button
└── InteractiveFeatures.tsx          - Updated with duet functionality

src/services/
├── duetService.ts                    - Client-side duet operations
└── duetVideoService.ts              - Video processing and merging

src/pages/
└── DuetDemo.tsx                     - Complete duet demo page
```

## 🚀 Getting Started

### 1. Database Setup

Run the duet migration to add required database fields:

```bash
npm run duet:migrate
```

To rollback the migration (if needed):

```bash
npm run duet:rollback
```

### 2. Start Development Server

```bash
npm run dev:comprehensive
```

### 3. Test the Feature

Run the automated test suite:

```bash
npm run duet:test
```

Visit the demo page:
```
http://localhost:3000/app/duet-demo
```

## 🎮 Usage Guide

### For Users

1. **Finding Videos to Duet**
   - Browse video feeds and look for the duet button (👥 icon)
   - Click the duet button to see style options

2. **Creating a Duet**
   - Choose duet style: Side-by-side, React & Respond, or Picture-in-Picture
   - Allow camera and microphone permissions
   - Adjust audio mix settings (original, voiceover, or both)
   - Start recording when ready
   - The original video will play automatically
   - Your recording will stop when the original video ends

3. **Publishing**
   - Review your duet in the preview
   - Edit caption and tags
   - Publish to your profile

### For Developers

#### Basic Integration

```tsx
import DuetEnabledVideoPlayer from '@/components/video/DuetEnabledVideoPlayer';

function VideoPage() {
  const handleDuetComplete = (duetData) => {
    console.log('Duet created:', duetData);
    // Handle duet completion (refresh feed, navigate, etc.)
  };

  return (
    <DuetEnabledVideoPlayer
      video={videoData}
      allowDuets={true}
      onDuetComplete={handleDuetComplete}
    />
  );
}
```

#### Custom Duet Recording

```tsx
import DuetRecorder from '@/components/video/DuetRecorder';

function CustomDuetFlow() {
  return (
    <DuetRecorder
      originalVideo={{
        id: 'video-id',
        url: 'video-url',
        duration: 30,
        creatorUsername: 'creator',
        creatorId: 'creator-id',
        title: 'Original Video'
      }}
      duetStyle="side-by-side"
      onCancel={() => setShowRecorder(false)}
      onComplete={(duetData) => {
        // Handle completion
        console.log('Duet completed:', duetData);
      }}
    />
  );
}
```

#### Using the Duet Service

```tsx
import duetService from '@/services/duetService';

// Get original video data
const originalData = await duetService.getOriginalVideoData(postId);

// Create a duet
const duetPost = await duetService.createDuet(
  originalPostId,
  videoBlob,
  thumbnailBlob,
  'side-by-side',
  'both',
  'Amazing duet!',
  ['duet', 'fun']
);

// Get duet chain
const duetChain = await duetService.getDuetChain(postId);

// Get duet statistics
const stats = await duetService.getDuetStats(postId);
```

## 🎨 Duet Styles

### Side-by-Side
- Original video on the left, user video on the right
- Both videos are equal size
- Best for: Dance routines, tutorials, collaborations

### React & Respond
- Original video on top, user video on bottom
- Stacked layout
- Best for: Reactions, responses, commentary

### Picture-in-Picture
- Original video as background, user video as small overlay
- User video appears in bottom-right corner
- Best for: Joining existing content, minimal intrusion

## 🔊 Audio Mixing Options

### Original Audio Only
- Only the original video's audio is included
- User's microphone is muted
- Best for: Lip-sync, dance challenges

### Voiceover Only
- Only the user's microphone audio is included
- Original video is muted
- Best for: Commentary, explanations

### Both (Default)
- Both audio sources are mixed together
- Volume levels can be adjusted independently
- Best for: Collaborations, conversations

## 📊 Analytics & Metrics

### Duet Statistics
- Total number of duets created
- Breakdown by duet style
- Audio source preferences
- Engagement metrics (likes, shares, comments)

### Performance Tracking
- View count for duets
- Completion rates
- Viral coefficient (duets of duets)
- Creator attribution metrics

## 🔧 Technical Specifications

### Video Requirements
- **Resolution**: 720p minimum, 1080p maximum
- **Format**: WebM (recording), MP4 (playback)
- **Duration**: 15 seconds to 3 minutes
- **File Size**: 100MB maximum
- **Frame Rate**: 30fps recommended

### Audio Requirements
- **Format**: Opus (WebM), AAC (MP4)
- **Sample Rate**: 44.1kHz or 48kHz
- **Channels**: Stereo
- **Bitrate**: 128kbps minimum

### Browser Support
- **Chrome**: 88+ (recommended)
- **Firefox**: 85+
- **Safari**: 14.1+
- **Edge**: 88+

### Device Requirements
- **Camera**: Required for recording
- **Microphone**: Required for audio
- **Minimum RAM**: 4GB recommended
- **Network**: Stable internet for upload

## 🛠️ Development Notes

### File Structure
```
/duet-feature/
├── components/
│   ├── DuetRecorder.tsx              # Main recording interface
│   ├── DuetEnabledVideoPlayer.tsx    # Video player with duet support
│   └── InteractiveFeatures.tsx      # Enhanced with duet options
├── services/
│   ├── duetService.ts               # API interactions
│   └── duetVideoService.ts          # Video processing
├── types/
│   └── duet.ts                      # TypeScript definitions
└── pages/
    └── DuetDemo.tsx                 # Demo implementation
```

### State Management
- Local state for recording UI
- Context for sharing duet data
- Service layer for API calls
- Optimistic updates for better UX

### Performance Optimizations
- Video preloading for smooth recording
- Canvas-based video merging for performance
- Chunked recording for memory efficiency
- Background processing for uploads

## 🐛 Troubleshooting

### Common Issues

#### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try refreshing the page
- Check device privacy settings

#### Video Not Syncing
- Ensure stable internet connection
- Check video file format compatibility
- Try reducing video quality
- Clear browser cache

#### Upload Failures
- Check file size (max 100MB)
- Verify network connection
- Ensure video format is supported
- Try again with smaller video

#### Audio Issues
- Check microphone permissions
- Verify audio input device
- Adjust volume levels
- Test audio in other applications

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('duet-debug', 'true');
```

## 🔮 Future Enhancements

### Planned Features
- **AR Effects**: Face filters and effects during recording
- **Background Music**: Add background tracks to duets
- **Advanced Editing**: Trim, cut, and enhance duets
- **Collaborative Editing**: Multiple users in one duet
- **Live Duets**: Real-time duet streaming
- **AI Suggestions**: Smart duet partner suggestions

### API Improvements
- **Batch Operations**: Create multiple duets at once
- **Advanced Analytics**: ML-powered insights
- **Content Moderation**: Automated duet screening
- **Quality Enhancement**: AI-powered video upscaling

## 📝 Contributing

### Adding New Duet Styles
1. Update the `duetStyle` type in TypeScript definitions
2. Add rendering logic to `DuetVideoService.drawDuetFrame()`
3. Update UI options in duet selection dialogs
4. Add database migration for new style
5. Update documentation

### Adding Audio Effects
1. Extend `DuetVideoService.createMixedAudioStream()`
2. Add new audio processing options
3. Update UI controls in `DuetRecorder`
4. Test across different devices

## 📄 License

This duet feature implementation is part of the Eloity platform and follows the same licensing terms.

---

## 🎉 Success! 

Your duet feature is now fully implemented and ready to use. Users can create collaborative videos with advanced recording capabilities, multiple styles, and sophisticated audio mixing - all within a seamless, TikTok-style interface.

For support or questions, check the troubleshooting section above or create an issue in the project repository.
