import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { createCommentDTO } from './DTO/comment.dto.js';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CommentService } from './comment.service.js';
import { messages } from '../../common/enums/messages.enum.js';
import { plainToInstance } from 'class-transformer';
import { createCommentSerializer, updateCommentSerializer } from './Serializer/comment.serializer.js';

@UseGuards(AuthGuard)
@Controller('api/comments')
export class CommentController {

    constructor(private commentService: CommentService) { }

    @Post(":postId")
    async addComment(@Body() comment: createCommentDTO, @Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const commentData = await this.commentService.addComment(comment, postId, req.query.parentCommentId, req.user)

        const sanitizedComment = this.sanitizeComment(commentData)
        const serializedComment = plainToInstance(
            createCommentSerializer,
            sanitizedComment,
            { excludeExtraneousValues: true }
        )
        return { data: serializedComment, message: "Comment added successfully" }

    }



    @Get(":postId")
    async getAllComments(@Param("postId", ParseObjectIdPipe) postId, @Req() req) {

        const comments = await this.commentService.getAllComment(postId, req.query?.parentCommentId)
        let sanitizedComments: any = [];
        if (Array.isArray(comments)) {
            sanitizedComments = comments.map(comment => this.sanitizeComment(comment))
        }

        const serializedComments = plainToInstance(
            createCommentSerializer,
            sanitizedComments,
            { excludeExtraneousValues: true }

        )
        return { data: serializedComments, message: "Comments fetched successfully" }
    }


    @Put(":id")
    async updateComment(@Body() comment: createCommentDTO, @Param("id", ParseObjectIdPipe) id, @Req() req) {

        const updatedComment = await this.commentService.updateComment(id, comment.content, req.user)
        const sanitizedComment = this.sanitizeComment(updatedComment)
        const serializedComment = plainToInstance(
            updateCommentSerializer,
            sanitizedComment,
            { excludeExtraneousValues: true }
        )

        return { data: serializedComment, message: "Comment updated Successfully" }
    }



    @Delete(":id")
    async deleteComment(@Param("id", ParseObjectIdPipe) id, @Req() req) {
        await this.commentService.deleteComment(id, req.user)
        return { message: "Comment deleted Successfully" }
    }


    sanitizeComment(comment: any) {
        console.log("sanitization started")
        const commentObj = comment && typeof comment.toObject === "function" ? comment.toObject() : comment;
        if (commentObj && commentObj._id) {
            commentObj._id = commentObj._id.toString()

        }

        if (commentObj && commentObj.user && commentObj.user._id) {
            commentObj.user._id = commentObj.user._id.toString()
        }
        if (commentObj && commentObj.parentCommentId) {
            commentObj.parentCommentId = commentObj.parentCommentId.toString()
        }

        return commentObj;
    }

}
