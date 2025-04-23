import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/model/User";
import { userNameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }

        //validation with zod
        const result = UsernameQuerySchema.safeParse(queryParams);
        // console.log("result:", result);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(", ")
                    : 'Invalid query parameters',
            }, { status: 400 })
        }

        const { username } = result.data;
        // console.log("username:", username);


        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'Username is alredy taken',
            }, { status: 400 });
        }

        return Response.json(
            {
                success: true,
                message: 'Username is unique',
            },
            { status: 200 }
        );


    } catch (error) {
        console.log("Error checking username:", error);
        return Response.json({
            success: false, message: "Error checking username"
        }, { status: 500 })
    }
}