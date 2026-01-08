import api from './api';

// Get posts (including reels) for a user
export const getUserPosts = async (userId) => {
  try {
    const response = await api.get(`/social/users/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

// Create a new reel
export const createReel = async (formData) => {
  try {
    const response = await api.post('/social/reels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

// Toggle like on a reel/post
export const togglePostLike = async (contentId, contentType = 'reel') => {
  try {
    const response = await api.post('/social/like', {
      contentType,
      contentId
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get comments for a reel/post
export const getPostComments = async (contentId, contentType = 'reel') => {
  try {
    const response = await api.get(`/social/comments/${contentType}/${contentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Add a comment or reply to a reel/post
export const addComment = async (contentId, commentText, contentType = 'reel', parentCommentId = null) => {
  try {
    const response = await api.post('/social/comments', {
      contentType,
      contentId,
      text: commentText,
      parentCommentId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Toggle like on a comment
export const toggleCommentLike = async (commentId) => {
  try {
    const response = await api.post('/social/like', {
      contentType: 'comment',
      contentId: commentId
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

// Get all reels (feed)
export const getReelsFeed = async () => {
  try {
    const response = await api.get('/social/reels/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching reels feed:', error);
    throw error;
  }
};
