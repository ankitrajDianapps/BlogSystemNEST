import { IsNotEmpty, IsString } from "class-validator";

export class createCommentDTO {
    @IsString()
    @IsNotEmpty()
    content: string
}