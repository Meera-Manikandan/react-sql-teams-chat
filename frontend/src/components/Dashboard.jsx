import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import logo from "../assets/icon-left-font-monochrome-white.svg";
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [image, setImage] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchPosts(parsedUser.id);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchPosts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/posts/${userId}`);
      const data = await response.json();

      const updatedPosts = data.map((post) => {
        const isLiked = post.liked === 1; // Correctly checking if post is liked
        console.log(`Post ID: ${post.id}, Liked by user: ${isLiked}`);

        return {
          ...post,
          uniqueKey: post.id || `temp-${index}`,
          read: post.read_status === 1,
          liked: isLiked,
        };
      });

      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("content", postContent);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5001/posts/create-post", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPostContent("");
        setImage(null);
        fetchPosts(user.id);
      } else {
        alert(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const handleDeletePost = async (postId, userId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        `http://localhost:5001/posts/delete-post/${postId}/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Post deleted successfully");
        fetchPosts(user.id);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/posts/toggle-like/${postId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, liked: data.liked } : post
          )
        );
      } else {
        alert(data.error || "Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleMarkAsRead = async (e, postId, userId) => {
    if (e.target.tagName === "BUTTON") return;
    try {
      await fetch(`http://localhost:5001/posts/mark-read/${postId}/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, read: true } : post
        )
      );
    } catch (error) {
      console.error("Error marking post as read:", error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (e, postId, userId) => {
    e.preventDefault(); // Prevent the default action for the button
    e.stopPropagation(); // Stop the event from propagating to the parent .post-card div

    try {
      const response = await fetch(
        `http://localhost:5001/posts/modify-post/${postId}/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        }
      );

      if (response.ok) {
        setEditingPost(null);
        fetchPosts(user.id);
      } else {
        alert("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        const response = await fetch("http://localhost:5001/auth/delete-user", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: user.id }), // Send user ID in request body
        });

        if (response.ok) {
          alert("Account deleted successfully");
          localStorage.clear();
          navigate("/login");
        } else {
          const data = await response.json();
          alert(data.error || "Failed to delete account");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header with Logo and App Name */}
      <div className="dashboard-header">
        <div className="app-logo-container">
          <img src={logo} alt="App Logo" className="app-logo" />
        </div>

        <h1>Welcome, {user?.username || "Guest"}!</h1>
      </div>

      {/* Post Creation Form */}
      <form className="post-form" onSubmit={handlePostSubmit}>
        <label htmlFor="postContent">What's in your mind:</label>
        <textarea
          id="postContent"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write something..."
          rows="3"
        ></textarea>
        <label htmlFor="imageUpload">Would you like to share a file?</label>
        <input type="file" id="imageUpload" onChange={handleFileChange} />
        <button type="submit">Post</button>
      </form>

      {/* Display Posts */}
      <div className="posts-container">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`post-card ${post.read ? "read" : "unread"}`}
            onClick={(e) => handleMarkAsRead(e, post.id, post.user_id)}
          >
            <h4>{post.username}</h4>
            {editingPost === post.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <button
                  onClick={(e) => handleSaveEdit(e, post.id, post.user_id)}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <p>{post.content}</p>
                {post.image_url && (
                  <img
                    src={`http://localhost:5001${post.image_url}`}
                    alt="User Upload"
                    className="post-image"
                  />
                )}
              </>
            )}
            <small>{new Date(post.created_at).toLocaleString()}</small>

            <div className="post-actions">
              <span onClick={() => handleToggleLike(post.id)}>
                {post.liked ? "Liked" : "Like"}
              </span>
              {user?.id === post.user_id && (
                <>
                  <span onClick={() => handleEditPost(post)}>Modify</span>
                  <span onClick={() => handleDeletePost(post.id, post.user_id)}>
                    Delete
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="logout-container">
        <button className="delete-btn" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
