import { IsBoolean, IsDate, IsEmail, IsEmpty, IsIn, IsNotEmpty, IsOptional, isString, IsString, Matches, maxLength, MaxLength, min, minLength, MinLength, } from "class-validator";

export class createUserDTO {

    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    userName: string;


    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @MaxLength(30)
    @MinLength(4)
    @IsString()
    @IsNotEmpty()
    password: string;


    @Matches(/^[a-zA-Z ]+$/, { message: "FullName must contain only letters" })
    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    bio: string;

    @IsIn(["user", "admin", "author"])
    @IsString()
    @IsNotEmpty()
    role: string;

}





export class loginUserDTO {

    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    email: string;

    @MaxLength(30)
    @MinLength(4)
    @IsString()
    @IsNotEmpty()
    password: string
}



export class updateUserDTO {

    @Matches(/^[a-zA-Z ]+$/, { message: "FullName must contain only letters" })
    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsOptional()
    fullName: string;

    @IsString()
    @IsOptional()
    bio: string;


}


export class refreshTokenDTO {
    @IsString()
    @IsNotEmpty()
    refreshToken: string
}


export class forgotPasswordDTO {

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string
}


export class verifyOtpDTO {

    @IsString()
    @IsNotEmpty()
    otp: string

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string
}

export class changePasswordDTO {

    @MaxLength(30)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    newPassword: string


    @IsString()
    @IsNotEmpty()
    token: string
}