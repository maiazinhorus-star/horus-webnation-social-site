import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import type { Post } from '../types';
import {
  Heart, MessageCircle, Share2, Send, Image, X,
  Trash2, Crown, ExternalLink
} from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const { posts, addPost, deletePost, likePost, addComment } = useData();
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleCreatePost = () => {
    if (!newPost.trim() && !postImage) return;
    addPost({
      userId: user.id,
      userNickname: user.nickname,
      userAvatar: user.avatar,
      content: newPost.trim(),
      image: postImage || undefined,
    });
    setNewPost('');
    setPostImage('');
    setShowImageInput(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPostImage(ev.target?.result as string);
        setShowImageInput(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComment = (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    addComment(postId, {
      userId: user.id,
      userNickname: user.nickname,
      userAvatar: user.avatar,
      content,
    });
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleShare = (post: Post, platform: string) => {
    const text = encodeURIComponent(`Veja este post de ${post.userNickname} no Horus WebNation! 👁️\n\n${post.content}`);
    const url = encodeURIComponent('https://horuswebnation.com');

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${post.content}\n\nCompartilhado do Horus WebNation 👁️`);
        alert('Link copiado! Compartilhe no Instagram.');
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
    setShowShareMenu(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Create Post */}
      <div className="card-dark rounded-2xl p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black font-bold text-sm">
                {user.nickname.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="O que você está pensando?"
              className="w-full bg-dark-800 border border-gold-600/20 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-all resize-none text-sm"
              rows={2}
            />
            {showImageInput && postImage && (
              <div className="relative">
                <img src={postImage} alt="Preview" className="rounded-xl max-h-48 object-cover" />
                <button
                  onClick={() => { setPostImage(''); setShowImageInput(false); }}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gold-400 text-sm transition-colors"
              >
                <Image className="w-4 h-4" /> Foto
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() && !postImage}
                className="btn-gold ml-auto px-4 py-1.5 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-gold-600/20 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gold-400" />
          </div>
          <p className="text-gray-500 text-lg">Nenhuma publicação ainda</p>
          <p className="text-gray-600 text-sm">Seja o primeiro a publicar!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user.id}
            isAdmin={user.isAdmin}
            onLike={() => likePost(post.id)}
            onDelete={() => deletePost(post.id)}
            commentInput={commentInputs[post.id] || ''}
            onCommentChange={(val) => setCommentInputs({ ...commentInputs, [post.id]: val })}
            onCommentSubmit={() => handleComment(post.id)}
            showComments={showComments[post.id] || false}
            onToggleComments={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
            showShareMenu={showShareMenu === post.id}
            onToggleShare={() => setShowShareMenu(showShareMenu === post.id ? null : post.id)}
            onShare={(platform) => handleShare(post, platform)}
            formatDate={formatDate}
          />
        ))
      )}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  isAdmin: boolean;
  onLike: () => void;
  onDelete: () => void;
  commentInput: string;
  onCommentChange: (val: string) => void;
  onCommentSubmit: () => void;
  showComments: boolean;
  onToggleComments: () => void;
  showShareMenu: boolean;
  onToggleShare: () => void;
  onShare: (platform: string) => void;
  formatDate: (date: string) => string;
}

function PostCard({
  post, currentUserId, isAdmin, onLike, onDelete,
  commentInput, onCommentChange, onCommentSubmit,
  showComments, onToggleComments, showShareMenu, onToggleShare, onShare, formatDate
}: PostCardProps) {
  const isLiked = post.likes.includes(currentUserId);

  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center overflow-hidden">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black font-bold">{post.userNickname.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-sm">{post.userNickname}</span>
              {post.userId === 'admin-001' && <Crown className="w-3 h-3 text-gold-400" />}
            </div>
            <span className="text-gray-500 text-xs">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {(currentUserId === post.userId || isAdmin) && (
          <button onClick={onDelete} className="text-gray-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-200 text-sm whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-3">
          <img src={post.image} alt="Post" className="rounded-xl w-full max-h-96 object-cover" loading="lazy" />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gold-600/10 flex items-center gap-2">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
            isLiked ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-red-400 hover:bg-dark-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {post.likes.length > 0 && post.likes.length}
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-dark-800 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments.length > 0 && post.comments.length}
        </button>
        <div className="relative">
          <button
            onClick={onToggleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gold-400 hover:bg-dark-800 transition-all"
          >
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={onToggleShare} />
              <div className="absolute bottom-full left-0 mb-2 bg-dark-800 border border-gold-600/20 rounded-xl p-2 z-20 shadow-xl min-w-[160px]">
                <button onClick={() => onShare('whatsapp')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-green-400/10 rounded-lg transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                  WhatsApp
                </button>
                <button onClick={() => onShare('instagram')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-pink-400 hover:bg-pink-400/10 rounded-lg transition-all">
                  <ExternalLink className="w-4 h-4" /> Instagram
                </button>
                <button onClick={() => onShare('telegram')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
                  <Send className="w-4 h-4" /> Telegram
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gold-600/10">
          {/* Existing Comments */}
          {post.comments.length > 0 && (
            <div className="space-y-3 py-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-black font-bold text-xs">{comment.userNickname.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="bg-dark-800 rounded-xl px-3 py-2 flex-1">
                    <span className="text-gold-400 text-xs font-semibold">{comment.userNickname}</span>
                    <p className="text-gray-300 text-xs mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex gap-2 pt-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center overflow-hidden flex-shrink-0">
              {currentUserId ? (
                <span className="text-black font-bold text-xs">V</span>
              ) : null}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-dark-800 border border-gold-600/20 rounded-full px-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
                onKeyDown={(e) => e.key === 'Enter' && onCommentSubmit()}
              />
              <button
                onClick={onCommentSubmit}
                disabled={!commentInput.trim()}
                className="text-gold-400 hover:text-gold-300 disabled:text-gray-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
