import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [image, setImage] = useState(null);
  const [readPosts, setReadPosts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchPosts();
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5001/posts/get-posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle post submission
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
        fetchPosts();
      } else {
        alert(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/posts/delete-post/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Handle Like/Dislike
  const handleLike = async (postId) => {
    await fetch(`http://localhost:5001/posts/like/${postId}`, {
      method: "POST",
    });
    fetchPosts();
  };

  const handleDislike = async (postId) => {
    await fetch(`http://localhost:5001/posts/dislike/${postId}`, {
      method: "POST",
    });
    fetchPosts();
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.username || "Guest"}!</h1>

      {/* Post Creation Form */}
      <form className="post-form" onSubmit={handlePostSubmit}>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write something..."
          rows="3"
        ></textarea>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Post</button>
      </form>

      {/* Display Posts */}
      <div className="posts-container">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`post-card ${
              !readPosts.includes(post.id) ? "unread" : ""
            }`}
            onClick={() => setReadPosts([...readPosts, post.id])}
          >
            <h4>{post.username}</h4>
            <p>{post.content}</p>
            {post.image_url && (
              <img
                src={`http://localhost:5001${post.image_url}`}
                alt="User Upload"
              />
            )}
            <small>{new Date(post.created_at).toLocaleString()}</small>

            {/* Like/Dislike & Delete */}
            <div className="post-actions">
              <div className="like-dislike">
                <button onClick={() => handleLike(post.id)}>
                  👍 {post.likes}
                </button>
                <button onClick={() => handleDislike(post.id)}>
                  👎 {post.dislikes}
                </button>
              </div>
              {post.user_id === user.id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out & Delete Account */}
      <div className="logout-container">
        <button onClick={() => navigate("/")}>Delete Account</button>
        <button
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
