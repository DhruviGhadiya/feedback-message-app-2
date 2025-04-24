import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";
import { NextRequest } from "next/server";


export async function DELETE(
    request: NextRequest,    
    context: { params: { messageid: string } }
    // { params }: { params: { messageid: string } }
) {
    const { messageid: messageId } = context.params;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const _user: User = session?.user as User;

    if (!session || !session?.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    try {
        const updateResult = await UserModel.updateOne(
            { _id: _user._id },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount == 0) {
            return Response.json({
                success: false,
                message: "Messagenot found or already deleted"
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: "Message Deleted Successfully"
        }, { status: 200 });

    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }

}