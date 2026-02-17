import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { createPostDTO, updatePostDTO } from './DTO/post.dto.js';
import { PostService } from './post.service.js';
import { ParseObjectIdPipe } from '../../pipe/parseobject-id.pipe.js';
import { get } from 'mongoose';
import { messages } from '../../common/enums/messages.enum.js';
import { plainToInstance } from 'class-transformer';
import { createPostSerializer, getAllPublishedPostsSerializer, getPostsSerializer, updatedPostSerializer } from './Serializer/post.serializer.js';
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('/api/posts')
export class PostController {

    constructor(private readonly postService: PostService) { }

    @Post()
    async createPost(@Body() data: createPostDTO, @Req() req) {
        const post = await this.postService.createPost(data, req.user)

        // Sanitize ID
        const sanitizedPost = this.sanitizePostId(post);
        const serializedPost = plainToInstance(
            createPostSerializer,
            sanitizedPost,
            { excludeExtraneousValues: true }

        )
        return { data: serializedPost, message: "Post created Successfully" }
    }


    @Get()
    async getAllPublishedPosts(@Query() query: any, @Req() req) {
        const posts = await this.postService.getAllPublishedPosts(query, req.user)

        let sanitizedPosts: any[] = [];
        if (Array.isArray(posts)) {
            sanitizedPosts = posts.map(post => this.sanitizePostId(post));
        }

        const serializedPosts = plainToInstance(
            getAllPublishedPostsSerializer,
            sanitizedPosts,
            { excludeExtraneousValues: true }
        )
        return { data: serializedPosts, message: "Posts fetched successfully" }

    }

    @Get("/my-posts")
    async getOwnPosts(@Req() req) {
        const posts = await this.postService.getOwnPosts(req.user)

        let sanitizedPosts: any[] = [];
        if (Array.isArray(posts)) {
            sanitizedPosts = posts.map(post => this.sanitizePostId(post));
        }

        const serializedPost = plainToInstance(
            getPostsSerializer,
            sanitizedPosts,
            { excludeExtraneousValues: true }
        )
        return { data: serializedPost, message: "Posts fetched Successfully" }
    }

    @Get('/:id')
    async getPostById(@Param("id", ParseObjectIdPipe) id, @Req() req) {

        const post = await this.postService.getPostById(id, req.user, req.ip)
        const sanitizedPost = this.sanitizePostId(post);
        const serializedPost = plainToInstance(getPostsSerializer, sanitizedPost, { excludeExtraneousValues: true })
        return { data: serializedPost, message: "Post fetched successfuly" }

    }

    @Patch("/:id")
    async updatePost(@Body() data: updatePostDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const updatedPost = await this.postService.updatePost(data, id, req.user, false)

        const sanitizedPost = this.sanitizePostId(updatedPost);

        const serializedPost = plainToInstance(
            updatedPostSerializer,
            sanitizedPost,
            { excludeExtraneousValues: true }
        )

        return { data: serializedPost, message: "Post updated successfully" }
    }


    @Patch("/:id/publish")
    async publishDraftPost(@Body() data: updatePostDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const publishedPost = await this.postService.updatePost(data, id, req.user, true);
        const sanitizedPost = this.sanitizePostId(publishedPost);
        const serializedPost = plainToInstance(updatedPostSerializer, sanitizedPost, { excludeExtraneousValues: true })
        return { data: serializedPost, message: "Post published succeessfully" }
    }

    @Delete(":id")
    async deletePost(@Param("id", ParseObjectIdPipe) id, @Req() req) {

        await this.postService.deletePost(id, req.user)
        return { message: "Post Deleted successfully" }
    }

    @Put("/:postId/like")
    async likePost(@Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        await this.postService.likePost(postId, req.user)
        return { message: "Post Liked Successfuly" }

    }


    @Put("/:postId/unlike")
    async unlikePost(@Param("postId") postId, @Req() req) {

        await this.postService.unlikePost(postId, req.user)
        return { message: "Post Unliked successfully" }
    }



    private sanitizePostId(post: any) {
        const postObj = post && typeof post.toObject === 'function' ? post.toObject() : post;
        if (postObj && postObj._id) {
            postObj._id = postObj._id.toString();
        }
        if (postObj && postObj.author && postObj.author._id) {
            postObj.author._id = postObj.author._id.toString();
        }
        return postObj;
    }

}
