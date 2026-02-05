import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class createPostDTO {

    @MaxLength(100)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    title: string;

    @MaxLength(1500)
    @MinLength(5)
    @IsString()
    @IsNotEmpty()
    content: string

    @MaxLength(300)
    @MinLength(5)
    @IsString()
    @IsOptional()
    excerpt: string

    @IsString()
    @IsOptional()
    tags: string

    @IsString()
    @IsOptional()
    category: string

    @IsIn(["published", "draft", "archived"])
    @IsString()
    @IsOptional()
    status: string

}



export class updatePostDTO {

    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsOptional()
    title: string;

    @MaxLength(1500)
    @MinLength(5)
    @IsString()
    @IsOptional()
    content: string

    @MaxLength(300)
    @MinLength(5)
    @IsString()
    @IsOptional()
    excerpt: string

    @IsString()
    @IsOptional()
    tags: string

    @IsString()
    @IsOptional()
    category: string


}