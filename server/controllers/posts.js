import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
    try {
        const { userId, description, picturePath } = req.body;
        const user = await User.findById(userId);

        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            userPicturePath: user.picturePath,
            picturePath,
            likes: {},
            comments: [],
        })
        await newPost.save();

        const post = await Post.find();
        // once new post is saved, need to do the Post.find to fetch the updated post list

        res.status(201).json(post);
         
    } catch (err) {
        res.status(409).json({ message: err.message })
    }
}

export const getFeedPosts = async (req, res) => {
    try {
        const post = await Post.find();
        res.status(200).json(post);

    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const post = await Post.find({ userId });
        res.status(200).json(post);

    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(id);

        const isLiked = post.likes.get(userId);
        // i.e. if it exists, it means the post has been liked by that person

        if (isLiked) {
            post.likes.delete(userId); // removing the like if it already exists
        } else {
            post.likes.set(userId, true); // else, sets the boolean "like" to true for that user i.e. they liked it
        }

        const updatedPost = await Post.findByIdAndUpdate(
          id,
          { likes: post.likes },
          { new: true }  
        );
        // updates the post with the new post.likes object

        res.status(200).json(updatedPost);

    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

// could also add update post, using above logic (but opted to focus on new features / functionality, esp given the ease of deleting and reposting)

export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        post.comments.push(req.body.comment)

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { comments: post.comments },
            { new: true }  
          );
          res.status(200).json(updatedPost);

    } catch (error) {
        res.status(404).json({ message: err.message })
    }
}
// pushes new comment to end of comment array, NOTE: Need the update part to make the changes stick

export const deleteComment = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const newComments = post.comments.filter((comment) => comment !== req.body.comment)

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { comments: newComments },
            { new: true }  
          );
          res.status(200).json(updatedPost);
    } catch (error) {
        res.status(404).json({ message: err.message })
    }
}
// filters comment out of comments array, NOTE: Need the update part to make the changes stick

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        if (!post) {
            return res.status(404).send("post not found")
        }
        res.status(200).json({msg: "post deleted"});
    } catch (error) {
        res.status(400).send(error)
    }
}

export const searchPosts = async (req, res) => {
    try {
        const data = await Post.find(
            {
                "$or" : [
                    {firstName: {$options: 'i', $regex: req.params.key} },
                    {description: {$options: 'i', $regex: req.params.key}},
                    {location: {$options: 'i', $regex: req.params.key}},
                ]
            }
        )
        res.send(data)
    } catch (error) {
        res.status(400).send(error)
    }
}
    
// above, $options: 'i', ignores case sensitivity! and $or returns if any of the statements match, e.g. firstName / location / description match the req params