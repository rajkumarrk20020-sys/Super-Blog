import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CommentSection = ({ blogId }) => {
  const { user, token, showToast } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tracks which comment ID is currently showing a reply text area
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Tracks collapsed replies by comment ID
  const [collapsedComments, setCollapsedComments] = useState({});

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/comments/blog/${blogId}`);
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await axios.post(
        '/api/comments',
        { blogId, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const commentData = res.data.data;
        if (commentData.status === 'Pending' && commentData.isSpam) {
          showToast('Comment flagged by spam filter and sent for admin review.', 'warning');
        } else {
          showToast('Comment posted successfully!', 'success');
          // Add comment locally since it is Approved
          // Populate the current user details for correct UI rendering immediately
          const populatedComment = {
            ...res.data.data,
            userId: {
              _id: user._id,
              name: user.name,
              profileImage: user.profileImage
            }
          };
          setComments([populatedComment, ...comments]);
        }
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit comment.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setReplySubmitting(true);
      const res = await axios.post(
        `/api/comments/${parentId}/reply`,
        { comment: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const replyData = res.data.data;
        if (replyData.status === 'Pending' && replyData.isSpam) {
          showToast('Reply flagged by spam filter and sent for moderation.', 'warning');
        } else {
          showToast('Reply posted successfully!', 'success');
          const populatedReply = {
            ...res.data.data,
            userId: {
              _id: user._id,
              name: user.name,
              profileImage: user.profileImage
            }
          };
          setComments([...comments, populatedReply]);
        }
        setReplyText('');
        setReplyTargetId(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to post reply.', 'danger');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      showToast('Please login to like comments.', 'info');
      return;
    }

    try {
      const res = await axios.put(
        `/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments(
          comments.map((c) => (c._id === commentId ? { ...c, likes: res.data.likes, likeCount: res.data.likeCount } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (commentId) => {
    if (!user) {
      showToast('Please login to report comments.', 'info');
      return;
    }

    const reason = window.prompt('Enter reason for reporting this comment (e.g. Offensive, Spam, Harassment):');
    if (!reason) return;

    try {
      const res = await axios.put(
        `/api/comments/${commentId}/report`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Comment reported. Thank you for making our platform safe.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to report comment.', 'danger');
    }
  };

  const toggleCollapse = (id) => {
    setCollapsedComments((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group comments into roots (no parentId) and replies (associated with parentId)
  const rootComments = comments.filter((c) => !c.parentId && !c.isDeleted);
  const getRepliesFor = (parentId) => comments.filter((c) => c.parentId === parentId && !c.isDeleted);

  const renderComment = (comment) => {
    const replies = getRepliesFor(comment._id);
    const hasLiked = user && comment.likes?.includes(user._id);
    const isReply = comment.replyLevel > 0;
    const isCollapsed = collapsedComments[comment._id];

    return (
      <div key={comment._id} className={`d-flex gap-2 gap-sm-3 mt-3 ${isReply ? 'border-start ps-2 ps-sm-3 ms-2 ms-sm-4' : 'mb-4 border-bottom pb-3'}`}>
        
        {/* Commenter profile pic */}
        {comment.userId?.profileImage ? (
          <img
            src={comment.userId.profileImage}
            alt={comment.userId.name}
            className="rounded-circle mt-1 flex-shrink-0"
            style={{ width: isReply ? '32px' : '44px', height: isReply ? '32px' : '44px', objectFit: 'cover' }}
          />
        ) : (
          <div 
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold mt-1 flex-shrink-0" 
            style={{ width: isReply ? '32px' : '44px', height: isReply ? '32px' : '44px', fontSize: isReply ? '12px' : '16px' }}
          >
            {comment.userId?.name ? comment.userId.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        <div className="flex-grow-1">
          <div className="comment-bubble shadow-sm bg-light p-3 rounded-4 position-relative">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span>{comment.userId?.name || 'Deleted User'}</span>
                {comment.isPinned && (
                  <span className="badge bg-primary text-white d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                    <i className="bi bi-pin-angle-fill"></i> Pinned
                  </span>
                )}
              </h6>
              <span className="text-muted small" style={{ fontSize: '11px' }}>
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <p className="mb-0 text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {comment.comment}
            </p>
            
            {/* Comment interaction panel */}
            <div className="d-flex align-items-center gap-3 mt-3 pt-2 border-top border-light" style={{ fontSize: '12px' }}>
              <button 
                type="button" 
                className={`btn btn-link p-0 text-decoration-none d-flex align-items-center gap-1 ${hasLiked ? 'text-primary' : 'text-muted'}`}
                onClick={() => handleLike(comment._id)}
              >
                <i className={`bi ${hasLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{comment.likeCount || comment.likes?.length || 0}</span>
              </button>

              {user && (
                <button 
                  type="button" 
                  className="btn btn-link p-0 text-decoration-none text-muted d-flex align-items-center gap-1"
                  onClick={() => {
                    setReplyTargetId(replyTargetId === comment._id ? null : comment._id);
                    setReplyText('');
                  }}
                >
                  <i className="bi bi-reply"></i>
                  <span>Reply</span>
                </button>
              )}

              <button 
                type="button" 
                className="btn btn-link p-0 text-decoration-none text-muted ms-auto d-flex align-items-center gap-1 hover-danger"
                onClick={() => handleReport(comment._id)}
              >
                <i className="bi bi-flag"></i>
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Reply Form inside comment bubble */}
          {replyTargetId === comment._id && (
            <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="mt-3 card p-3 border-light shadow-sm">
              <div className="mb-2">
                <textarea
                  className="form-control form-control-premium form-control-sm"
                  rows="2"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={() => setReplyTargetId(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary rounded-pill px-3"
                  disabled={replySubmitting}
                >
                  {replySubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}

          {/* Toggle replies view */}
          {replies.length > 0 && (
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none text-secondary fw-semibold d-flex align-items-center gap-1"
                onClick={() => toggleCollapse(comment._id)}
                style={{ fontSize: '12px' }}
              >
                <i className={`bi ${isCollapsed ? 'bi-plus-square' : 'bi-dash-square'}`}></i>
                <span>{isCollapsed ? `Show ${replies.length} replies` : 'Hide replies'}</span>
              </button>
            </div>
          )}

          {/* Recursively render replies */}
          {!isCollapsed && replies.map((reply) => renderComment(reply))}

        </div>
      </div>
    );
  };

  return (
    <div className="mt-5">
      <h3 className="fw-bold mb-4">Discussion ({comments.filter(c => !c.isDeleted).length})</h3>

      {/* Leave a Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-5 card border-0 shadow-sm p-4 rounded-4">
          <h5 className="fw-bold mb-3">Join the conversation</h5>
          <div className="mb-3">
            <textarea
              className="form-control form-control-premium"
              rows="3"
              placeholder="What are your thoughts on this topic?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-premium-primary align-self-start" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="alert alert-info rounded-4 p-4 mb-5 border-0 shadow-sm">
          <i className="bi bi-info-circle-fill me-2 fs-5"></i>
          Please <Link to="/login" className="fw-bold text-decoration-none">login</Link> to participate in the discussion.
        </div>
      )}

      {/* Render comments tree */}
      {loading ? (
        <div className="d-flex flex-column gap-3 py-4">
          {[1, 2].map((s) => (
            <div key={s} className="d-flex gap-3 skeleton-loader-comment animate-pulse">
              <div className="rounded-circle bg-light" style={{ width: '44px', height: '44px' }}></div>
              <div className="flex-grow-1">
                <div className="bg-light rounded-4 p-4" style={{ height: '100px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : rootComments.length > 0 ? (
        <div className="d-flex flex-column">
          {rootComments.map((c) => renderComment(c))}
        </div>
      ) : (
        <p className="text-muted py-3">No comments yet. Be the first to start the conversation!</p>
      )}
    </div>
  );
};

export default CommentSection;
