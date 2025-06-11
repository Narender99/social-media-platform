// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialMedia {
    // Structs
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likes;
        uint256 comments;
    }

    struct Comment {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
    }

    struct Profile {
        string username;
        string bio;
        string profilePicUrl;
    }

    // State variables
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(uint256 => Comment)) public commentsByPost;
    mapping(uint256 => uint256) public commentCountByPost;
    mapping(address => Profile) public profiles;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    uint256 public postCount;
    uint256 public commentCount;

    // Events
    event PostCreated(uint256 indexed postId, address indexed author, string content, uint256 timestamp);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event PostUnliked(uint256 indexed postId, address indexed unliker);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed author, string content);
    event ProfileUpdated(address indexed user, string username, string bio, string profilePicUrl);

    // Modifiers
    modifier validPostId(uint256 postId) {
        require(postId > 0 && postId <= postCount, "Invalid post ID");
        _;
    }

    // Core functions
    function createPost(string calldata content) external {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(bytes(content).length <= 280, "Content too long");

        postCount++;
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likes: 0,
            comments: 0
        });

        emit PostCreated(postCount, msg.sender, content, block.timestamp);
    }

    function likePost(uint256 postId) external validPostId(postId) {
        require(!postLikes[postId][msg.sender], "Already liked");

        postLikes[postId][msg.sender] = true;
        posts[postId].likes++;

        emit PostLiked(postId, msg.sender);
    }

    function unlikePost(uint256 postId) external validPostId(postId) {
        require(postLikes[postId][msg.sender], "Not liked");

        postLikes[postId][msg.sender] = false;
        posts[postId].likes--;

        emit PostUnliked(postId, msg.sender);
    }

    function addComment(uint256 postId, string calldata content) external validPostId(postId) {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(bytes(content).length <= 280, "Content too long");

        commentCount++;
        uint256 commentId = commentCount;
        Comment memory newComment = Comment({
            id: commentId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp
        });

        commentsByPost[postId][commentCountByPost[postId]] = newComment;
        commentCountByPost[postId]++;
        posts[postId].comments++;

        emit CommentAdded(postId, commentId, msg.sender, content);
    }

    function updateProfile(string calldata username, string calldata bio, string calldata profilePicUrl) external {
        require(bytes(username).length <= 50, "Username too long");
        require(bytes(bio).length <= 160, "Bio too long");
        require(bytes(profilePicUrl).length <= 200, "Profile picture URL too long");

        profiles[msg.sender] = Profile({
            username: username,
            bio: bio,
            profilePicUrl: profilePicUrl
        });

        emit ProfileUpdated(msg.sender, username, bio, profilePicUrl);
    }

    // View functions
    function getPosts(uint256 offset, uint256 limit) external view returns (Post[] memory) {
        uint256 resultCount = limit;
        if (offset >= postCount) {
            return new Post[](0);
        }
        if (offset + limit > postCount) {
            resultCount = postCount - offset;
        }

        Post[] memory result = new Post[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = posts[postCount - offset - i];
        }
        return result;
    }

    function getPost(uint256 postId) external view validPostId(postId) returns (Post memory) {
        return posts[postId];
    }

    function getComments(uint256 postId) external view validPostId(postId) returns (Comment[] memory) {
        Comment[] memory result = new Comment[](commentCountByPost[postId]);
        for (uint256 i = 0; i < commentCountByPost[postId]; i++) {
            result[i] = commentsByPost[postId][i];
        }
        return result;
    }

    function getProfile(address user) external view returns (string memory username, string memory bio, string memory profilePicUrl) {
        Profile memory profile = profiles[user];
        return (profile.username, profile.bio, profile.profilePicUrl);
    }

    function isPostLiked(uint256 postId, address user) external view returns (bool) {
        return postLikes[postId][user];
    }
}
