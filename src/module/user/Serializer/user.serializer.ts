import { Exclude, Expose, Transform } from "class-transformer"
import mongoose from "mongoose"

export class registerUserSerializer {

    @Expose()
    _id: string

    @Expose()
    userName: string

    @Expose()
    email: string

    @Exclude()
    password: string

    @Expose()
    fullName: string

    @Expose()
    bio: string

    @Expose()
    role: string

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
}




export class loginUserSerializer {

    @Expose()
    accessToken: string

    @Expose()
    refreshToken: string

}



export class updateUserSerializer extends registerUserSerializer { }

export class userProfileSerializer extends registerUserSerializer { }


export class refreshTokenSerializer {
    @Expose()
    accessToken: string
}