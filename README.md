<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Eventello Bot Frontend Integration

This project demonstrates how to connect your frontend to the Eventello bot using the Botpress Chat API webhook system.

## 🚀 Quick Start

### 1. Start the Eventello Bot
```bash
cd bots/eventello
pnpm dev
```

### 2. Test the Webhook Connection
```bash
# From the root directory
pnpm chat:demo:webhook
```

### 3. Run Your Frontend
```bash
npm start
# or
yarn start
# or
pnpm start
```

## 🎯 What I've Implemented for You

### ✅ **Complete Chat Interface Component** (`components/ChatInterface.tsx`)
- **Real-time chat UI** with user and bot messages
- **Automatic connection** to the Eventello bot
- **Connection status indicator** showing bot connection state
- **Typing indicators** when the bot is responding
- **Auto-scroll** to latest messages
- **Error handling** and reconnection capabilities
- **Responsive design** for mobile and desktop

### ✅ **Beautiful Styling** (`styles/ChatInterface.css`)
- **Modern chat bubble design** similar to WhatsApp/Telegram
- **Smooth animations** and transitions
- **Dark mode support** (automatic based on system preference)
- **Mobile-responsive** layout
- **Professional color scheme** and typography

### ✅ **Updated App Component** (`App.tsx`)
- **Simple integration** of the chat interface
- **Clean, focused layout** for the chat experience

## 🔧 How It Works

1. **Initialization**: When the component loads, it automatically connects to the Eventello bot
2. **Real-time Communication**: Uses Server-Sent Events (SSE) to receive instant bot responses
3. **Message Handling**: Sends user messages and displays bot responses in real-time
4. **Connection Management**: Automatically handles connection status and reconnection

## 💬 Example Usage

The chat interface will automatically:
- Connect to the Eventello bot
- Show connection status
- Display a welcome message
- Allow users to send messages like "events"
- Show real-time bot responses
- Handle the complete booking flow

## 🎮 Try These Commands

Once connected, try these messages in the chat:

1. **"events"** - Get list of available events
2. **"1"** - Select the first event
3. **"1"** - Select ticket type
4. **"2"** - Choose quantity
5. **"John Doe"** - Provide your name

## 🛠️ Technical Details

### Dependencies Used
- **React** with TypeScript
- **Axios** for HTTP requests
- **EventSource** for real-time communication

### Key Features
- **TypeScript interfaces** for type safety
- **Error boundaries** and fallback handling
- **Memory leak prevention** with proper cleanup
- **Accessibility** considerations
- **Performance optimized** with proper React patterns

## 🔍 Troubleshooting

### Common Issues:

1. **Bot Not Responding**
   - Ensure the Eventello bot is running (`pnpm dev` in `bots/eventello`)
   - Check browser console for connection errors

2. **Connection Failed**
   - Verify the webhook URL is correct
   - Check if the bot is accessible at the webhook endpoint

3. **Messages Not Sending**
   - Check browser console for API errors
   - Verify the bot service is properly initialized

### Debug Steps:
1. Open browser developer tools
2. Check the Console tab for error messages
3. Check the Network tab for failed API requests
4. Verify the connection status indicator

## 📱 Mobile Experience

The chat interface is fully responsive and works great on:
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **Tablet devices** (iPad, Android tablets)

## 🎨 Customization

You can easily customize:
- **Colors** by modifying the CSS variables
- **Layout** by adjusting the component structure
- **Animations** by tweaking the CSS keyframes
- **Styling** to match your brand colors

## 🚀 Next Steps

1. **Test the integration** with the running Eventello bot
2. **Customize the styling** to match your design system
3. **Add additional features** like message history, file uploads, etc.
4. **Integrate with your existing app** by importing the ChatInterface component

## 🎉 Success!

Your frontend is now fully connected to the Eventello bot! Users can:
- Browse events
- Select tickets
- Complete bookings
- Ask questions
- Get real-time assistance

The integration provides the exact same experience as the `pnpm chat:demo:webhook` command, but through a beautiful, user-friendly chat interface.
