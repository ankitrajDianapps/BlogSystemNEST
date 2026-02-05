import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { createPostDTO, updatePostDTO } from './DTO/post.dto.js';
import { PostService } from './post.service.js';
import { ParseObjectIdPipe } from '../../pipe/parseobject-id.pipe.js';
import { get } from 'mongoose';
import { messages } from '../../common/enums/messages.enum.js';


@UseGuards(AuthGuard)
@Controller('/api/posts')
export class PostController {

    constructor(private readonly postService: PostService) { }

    @Post()
    async createPost(@Body() data: createPostDTO, @Req() req) {
        return this.postService.createPost(data, req.user)
    }


    @Get()
    async getAllPublishedPosts(@Query() query: any, @Req() req) {
        const posts = await this.postService.getAllPublishedPosts(query, req.user)
        return { data: posts, message: "Posts fetched successfully" }

    }

    @Get("/my-posts")
    async getOwnPosts(@Req() req) {
        const posts = await this.postService.getOwnPosts(req.user)
        return { data: posts, message: "Posts fetched Successfully" }
    }

    @Get('/:id')
    async getPostById(@Param("id", ParseObjectIdPipe) id, @Req() req) {

        const post = await this.postService.getPostById(id, req.user, req.ip)
        return { data: post, message: "Post fetched successfuly" }

    }

    @Patch("/:id")
    async updatePost(@Body() data: updatePostDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const updatedPost = await this.postService.updatePost(data, id, req.user, false)
        return { data: updatedPost, message: "Post updated successfully" }
    }


    @Patch("/:id/publish")
    async publishDraftPost(@Body() data: updatePostDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const publishedPost = await this.postService.updatePost(data, id, req.user, true);
        return { data: publishedPost, message: "Post published succeessfully" }
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



}

