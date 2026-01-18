import { useSelector } from "react-redux";
import Post from "./Post";

function Posts() {
  const { posts } = useSelector((store) => store.post);
  
  return (
    <div className="space-y-6">
      {posts?.map((post) => (
        <Post key={post._id} post={post} />
      ))}
      
      {/* Empty State */}
      {(!posts || posts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No posts yet</h3>
          <p className="text-muted-foreground text-sm">Follow people to see their photos and videos.</p>
        </div>
      )}
    </div>
  );
}

export default Posts;
