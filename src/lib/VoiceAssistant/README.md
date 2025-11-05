# InterviewSystemCheck Component

A comprehensive system check interface for interview preparation, designed to verify audio, video, and internet connectivity before starting an interview.

## Features

- **Real-time System Checks**: Automatically checks internet, audio, microphone, and video devices
- **Video Preview**: Shows a preview of the candidate's video feed
- **Connection Status**: Displays latency and connection quality indicators
- **Responsive Design**: Fully responsive across desktop and mobile devices
- **Interactive Elements**: Dropdown selectors for device configuration
- **Progress Indicators**: Visual feedback for system check completion

## Usage

```tsx
import InterviewSystemCheck from "@/lib/VoiceAssistant/InterviewSystemCheck";

function InterviewPage() {
  const handleSystemCheckComplete = () => {
    console.log("All systems checked and ready");
  };

  const handleStartInterview = () => {
    // Navigate to actual interview
    router.push("/interview/interview-id");
  };

  return (
    <InterviewSystemCheck
      candidateName="Christopher Jones"
      jobTitle="Software Engineer Interview"
      onSystemCheckComplete={handleSystemCheckComplete}
      onStartInterview={handleStartInterview}
    />
  );
}
```

## Props

| Prop                    | Type         | Default                         | Description                              |
| ----------------------- | ------------ | ------------------------------- | ---------------------------------------- |
| `candidateName`         | `string`     | `"Christopher Jones"`           | Name of the candidate                    |
| `jobTitle`              | `string`     | `"Software Engineer Interview"` | Title of the interview                   |
| `onSystemCheckComplete` | `() => void` | `undefined`                     | Callback when system checks complete     |
| `onStartInterview`      | `() => void` | `undefined`                     | Callback when start interview is clicked |

## Design Features

### Layout Structure

- **Header**: Displays current time and interview title
- **Left Panel**: Video preview with connection status badges
- **Right Panel**: System check status with device selectors
- **Bottom**: Start interview button

### System Checks

1. **Internet**: Latency and connection quality
2. **Audio**: Speaker device selection
3. **Microphone**: Input device selection
4. **Video**: Camera device selection

### Responsive Behavior

- **Desktop**: Side-by-side layout with video preview and system checks
- **Mobile**: Stacked layout with video preview on top, system checks below

### Visual Elements

- Gradient video preview background
- Animated audio waveform indicators
- Status badges with color coding
- Gradient border on system check card
- Hover effects on interactive elements

## Styling

The component uses custom SCSS classes defined in `chat-styles.scss`:

- `.interview-system-check-container`: Main container
- `.interview-system-check-card`: Card wrapper
- `.video-preview-panel`: Video preview section
- `.system-check-panel`: System checks section
- `.connection-badges`: Status indicators
- `.system-check-item`: Individual check items

## Integration

This component is designed to integrate seamlessly with the existing VoiceAssistantV2 system and can be used as a pre-interview setup screen or as part of a larger interview flow.

## Demo

Visit `/interview-system-check-demo` to see the component in action.
