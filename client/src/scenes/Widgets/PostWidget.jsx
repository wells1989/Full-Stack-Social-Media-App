import {
    ChatBubbleOutlineOutlined,
    FavoriteBorderOutlined,
    FavoriteOutlined,
    ShareOutlined,
  } from "@mui/icons-material";
  import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material";
  import FlexBetween from "components/FlexBetween";
  import Friend from "components/Friend";
  import WidgetWrapper from "components/WidgetWrapper";
  import { useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { setPost, setPosts } from "state";
  import DeleteIcon from '@mui/icons-material/Delete';
  import AddCommentIcon from '@mui/icons-material/AddComment';
  import { InputBase } from '@mui/material';
  
  const PostWidget = ({
    postId,
    postUserId,
    name,
    description,
    location,
    picturePath,
    userPicturePath,
    likes,
    comments,
    isProfile
  }) => {
    const [isComments, setIsComments] = useState(false);
    const [comment, setComment] = useState("");
    const dispatch = useDispatch();
    const token = useSelector((state) => state.token);
    const loggedInUserId = useSelector((state) => state.user._id); // gets the logged in user id from state
    const isLiked = Boolean(likes[loggedInUserId]); // is loggedInUserId included in the likes array...
    const likeCount = Object.keys(likes).length;
  
    const { palette } = useTheme();
    const main = palette.neutral.main;
    const primary = palette.primary.main;
  
    const patchLike = async () => {
      const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    };
    // above, patch api request, then dispatches the setPost action (see state.js) with the updated post (updating the likes immediately)

    const getPosts = async () => {
      const response = await fetch("http://localhost:3001/posts", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    };

    const deletePost = async() => {
      const response = await fetch(`http://localhost:3001/posts/delete/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      await response.json();

      if(response.ok){
        alert("Post deleted")
        getPosts();
      }
    }
    // deletePost called on delete button, then refetches posts, to automatically refresh the posts

    const addComment = async () => {
      const response = await fetch (`http://localhost:3001/posts/comments/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ comment: comment }),
      });
      await response.json();

      if(response.ok){
        getPosts();
        setComment("");
      }
    }

    return (
      <WidgetWrapper m="2rem 0">
        {/*friend widget, showing the top part of the post*/}
        <Friend
          friendId={postUserId}
          name={name}
          location={location}
          userPicturePath={userPicturePath}
        />

        {/*Content and image*/}
        <Typography color={main} sx={{ mt: "1rem" }}>
          {description}
        </Typography>
        {picturePath && (
                    <img
                    width="100%"
                    height="auto"
                    alt="post"
                    style={{ borderRadius: "0.75rem", marginTop: "0.75 rem" }}
                    src={picturePath.startsWith("http") ? `${picturePath}` : `http://localhost:3001/assets/${picturePath}`} // ternary operator, either the http link or the local storage
                     />
                )}

          {/*like button and count*/}
        <FlexBetween mt="0.25rem">
          <FlexBetween gap="1rem">
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>
              <Typography>{likeCount}</Typography>
            </FlexBetween>
  
              {/*Comments button and dropdown menu*/}
            <FlexBetween gap="0.5rem">
              <IconButton onClick={() => setIsComments(!isComments)}>
                <ChatBubbleOutlineOutlined />
              </IconButton>
              <Typography>{comments.length}</Typography>
              <InputBase
                placeholder="Add Comment..."
                onChange={(e) => setComment(e.target.value)}
                 value={comment}
                 sx={{
                    width: "60%",
                    backgroundColor: palette.neutral.light,
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.5rem"
                 }}/>
              <IconButton>
                <AddCommentIcon onClick={addComment}/>
              </IconButton>
            </FlexBetween>
          </FlexBetween>
  
          {loggedInUserId === postUserId || isProfile ? ( // only shows delete button if it's your own post
                    <>
                    <IconButton>
                      <ShareOutlined />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon
                      onClick={deletePost}
                      />
                  </IconButton>
                    </>  
                      
          ) : (
            <IconButton>
            <ShareOutlined />
          </IconButton>
          )}
        </FlexBetween>
        {isComments && (
          <Box mt="0.5rem">
            {comments.map((comment, i) => (
              <Box key={`${name}-${i}`}>
                <Divider />
                <FlexBetween>
                  <Typography>
                    {comment}
                  </Typography>
                    <IconButton>
                  <DeleteIcon onClick={ async () => {
                    const response = await fetch (`http://localhost:3001/posts/comments/${postId}`, {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({ comment: comment }),
                    })
                    await response.json();
                    getPosts();
                  }
                    }/>
                  </IconButton>
                </FlexBetween>
              </Box>
            ))}
            <Divider />
          </Box>
        )}
      </WidgetWrapper>
    );
  };
  
  export default PostWidget;