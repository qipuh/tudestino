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

// Create a new reel (post with type='reel')
export const createReel = async (reelData) => {
  try {
    const response = await api.post('/social/posts', {
      ...reelData,
      type: 'reel',
    });
    return response.data;
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

// Toggle like on a reel/post
export const togglePostLike = async (postId) => {
  try {
    const response = await api.post(`/social/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get comments for a reel/post
export const getPostComments = async (postId) => {
  try {
    const response = await api.get(`/social/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Add a comment to a reel/post
export const addComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/social/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Toggle like on a comment
export const toggleCommentLike = async (commentId) => {
  try {
    const response = await api.post(`/social/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
};

// Get all reels (feed)
export const getReelsFeed = async () => {
  try {
    const response = await api.get('/social/posts?type=reel');
    return response.data;
  } catch (error) {
    console.error('Error fetching reels feed:', error);
    throw error;
  }
};
