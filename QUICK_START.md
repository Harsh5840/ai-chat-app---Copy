# Quick Start Guide - New Features

## 🎯 For Users

### Using Markdown in Messages

#### Basic Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
```

#### Code Blocks
Use triple backticks with language name:
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

#### Lists
```markdown
- Item 1
- Item 2
  - Nested item

1. First
2. Second
3. Third
```

#### Links & Images
```markdown
[Link text](https://example.com)
![Image alt](image-url.jpg)
```

### Uploading Files

1. **Drag and Drop**: Simply drag files into the chat input area
2. **Click to Upload**: Click the paperclip (📎) icon
3. **Preview**: See your file before sending
4. **Remove**: Click "Remove" to cancel upload

**Supported formats**: Images (PNG, JPG, GIF, WebP), PDFs, Text files  
**Max size**: 5MB

### Creating Custom Rooms

1. Go to Dashboard
2. Click "Create Custom Room" button
3. Enter a room name (e.g., "My Dev Team")
4. Select an AI assistant type
5. Click "Create Room"
6. Your new room appears in the dashboard!

### Typing Indicators

- When you type, others see "[Your Name] is typing..."
- When AI is processing, you see "AI is thinking..."
- Indicators disappear after 2 seconds of inactivity

---

## 💻 For Developers

### WebSocket Message Types

#### Join Room
```javascript
{
  type: 'join',
  roomName: 'room-DevGPT'
}
```

#### Typing Indicator
```javascript
{
  type: 'typing',
  roomName: 'room-DevGPT',
  userId: 123,
  isTyping: true // or false
}
```

#### Send Message
```javascript
{
  type: 'chat',
  content: 'Your message here',
  userId: 123,
  roomName: 'room-DevGPT'
}
```

### API Endpoints

#### Create Room
```http
POST /api/v1/room/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Custom Room",
  "botType": "devgpt"
}
```

**Response**: 
```json
{
  "id": 1,
  "name": "room-My Custom Room",
  "description": "Custom DevGPT room",
  "assistant": {
    "id": 1,
    "name": "devgpt",
    "description": "Expert coding assistant"
  }
}
```

### Component Usage

#### CreateRoomModal
```tsx
import CreateRoomModal from '@/components/create-room-modal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Room</button>
      <CreateRoomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRoomCreated={() => {
          console.log('Room created!')
          // Refresh your room list
        }}
      />
    </>
  )
}
```

### Styling Classes

#### Message Bubbles
```tsx
// User message
<div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl px-4 py-3">
  {content}
</div>

// AI message
<div className="bg-gray-800/90 text-gray-100 border border-gray-700/50 rounded-2xl px-4 py-3">
  {content}
</div>
```

#### Buttons
```tsx
// Primary action
<Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400">
  Submit
</Button>

// Secondary
<Button className="bg-gray-800 border-gray-700 hover:bg-gray-700">
  Cancel
</Button>
```

### Markdown Configuration

The markdown renderer supports:
- **GitHub Flavored Markdown** (via remark-gfm)
- **Syntax highlighting** (via react-syntax-highlighter)
- **Custom components** for code blocks and images

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const inline = !className
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }}
>
  {content}
</ReactMarkdown>
```

### File Upload Handling

```tsx
import { useDropzone } from 'react-dropzone'

const onDrop = (acceptedFiles: File[]) => {
  if (acceptedFiles.length > 0) {
    setSelectedFile(acceptedFiles[0])
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md']
  },
  maxSize: 5242880, // 5MB
  multiple: false
})
```

---

## 🎨 Design Tokens

### Colors
```css
/* Primary gradient */
from-cyan-500 to-blue-500

/* Background */
bg-gray-900 /* Main background */
bg-gray-800 /* Cards, inputs */
bg-black/70 /* Overlays */

/* Text */
text-white /* Primary */
text-gray-300 /* Secondary */
text-cyan-400 /* Accent */

/* Borders */
border-cyan-500/30 /* Default */
border-cyan-400 /* Active/hover */
```

### Spacing
```css
/* Padding */
px-4 py-3 /* Standard button/input */
p-6 /* Modal padding */

/* Gap */
gap-2 /* Tight spacing */
gap-4 /* Standard spacing */
gap-8 /* Loose spacing */
```

### Animations
```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Bounce (typing dots) */
animate-bounce

/* Pulse (backgrounds) */
animate-pulse
```

---

## 🧪 Testing

### Test Markdown Rendering
Send these messages to test markdown:

1. **Code block**:
   \`\`\`python
   def hello():
       print("Hello!")
   \`\`\`

2. **Inline code**: `const x = 5`

3. **Lists**:
   - Item 1
   - Item 2

4. **Bold/Italic**: **bold** and *italic*

### Test File Upload
1. Drag an image file
2. Check preview appears
3. Send message
4. Verify image displays inline

### Test Typing Indicators
1. Open room in two browser tabs
2. Start typing in one tab
3. See typing indicator in other tab
4. Stop typing for 2 seconds
5. Indicator should disappear

### Test Room Creation
1. Click "Create Custom Room"
2. Try creating without name (should error)
3. Try creating without bot selection (should error)
4. Create valid room
5. Check it appears in dashboard
6. Try creating duplicate name (should error)

---

## 🐛 Troubleshooting

### Typing Indicators Not Showing
- Check WebSocket connection
- Verify `userId` is set in localStorage
- Check console for errors

### Markdown Not Rendering
- Verify `react-markdown` is installed
- Check for syntax errors in markdown
- Look for console errors

### File Upload Not Working
- Check file size (max 5MB)
- Verify file type is supported
- Check browser console for errors

### Room Creation Fails
- Verify user is authenticated
- Check for duplicate room names
- Ensure bot type is valid

---

## 📚 Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [React Markdown Docs](https://github.com/remarkjs/react-markdown)
- [React Dropzone Docs](https://react-dropzone.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Happy Chatting! 🎉**
