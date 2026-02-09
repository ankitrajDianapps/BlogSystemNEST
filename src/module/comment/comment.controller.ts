import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { createCommentDTO } from './DTO/comment.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CommentService } from './comment.service.js';
import { messages } from '../../common/enums/messages.enum.js';

@UseGuards(AuthGuard)
@Controller('api/comments')
export class CommentController {

    constructor(private commentService: CommentService) { }

    @Post(":postId")
    async addComment(@Body() comment: createCommentDTO, @Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const commentData = await this.commentService.addComment(comment, postId, req.query.parentCommentId, req.user)

        return { data: commentData, message: "Comment added successfully" }

    }



    @Get(":postId")
    async getAllComments(@Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const comments = await this.commentService.getAllComment(postId, req.query?.parentCommentId)

        return { data: comments, message: "Comments fetched successfully" }
    }


    @Put(":id")
    async updateComment(@Body() comment: createCommentDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const updatedComment = await this.commentService.updateComment(id, comment.content, req.user)

        return { data: updatedComment, message: "Comment updated Successfully" }
    }


    @Delete(":id")
    async deleteComment(@Param("id", ParseObjectIdPipe) id, @Req() req) {
        await this.commentService.deleteComment(id, req.user)
        return { message: "Comment deleted Successfully" }
    }


}
