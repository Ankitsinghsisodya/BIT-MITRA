import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

function Comment({ comment }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={comment?.author?.profilePicture} />
        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
          {comment?.author?.userName?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold mr-2 hover:text-primary cursor-pointer transition-colors">
            {comment?.author?.userName}
          </span>
          <span className="text-foreground/90">{comment?.text}</span>
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">2h</span>
          <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}

export default Comment
