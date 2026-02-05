import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth-guard.guard.js';
import { createPostDTO } from './DTO/post.dto.js';
import { PostService } from './post.service.js';


@UseGuards(AuthGuard)
@Controller('api/posts')
export class PostController {

    constructor(private readonly postService: PostService) { }

    @Post()
    async createPost(@Body() data: createPostDTO, @Req() req) {
        return this.postService.createPost(data, req.user)
    }
}

