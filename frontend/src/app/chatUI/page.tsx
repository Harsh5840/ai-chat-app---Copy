export default function ChatUI() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary-foreground"></div>
        <div className="flex-1 flex flex-col">
          <div className="text-sm font-medium">User</div>
          <div className="text-sm text-muted-foreground">This is the message</div>
        </div>
      </div>
      
    </div>
  )
}