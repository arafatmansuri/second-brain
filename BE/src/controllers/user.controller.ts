import { z } from "zod";
import User from "../models/user.model";
import { Handler, IUser, IUserDocument, StatusCode } from "../types";
const userInputSchema = z.object({
  username: z.string().min(3),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercase",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercase",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special charcter",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
export const signup: Handler = async (req, res): Promise<void> => {
  try {
    const userInput = userInputSchema.safeParse(req.body);
    if (!userInput.success) {
      res.status(StatusCode.InputError).json({
        message:
          userInput.error.errors[0].message || "Username/Password required",
      });
      return;
    }
    const isUsernameAvailable = await User.isUserExists(
      userInput.data.username
    );
    if (isUsernameAvailable) {
      res
        .status(StatusCode.DocumentExists)
        .json({ message: "username already taken" });
      return;
    }
    const user: IUserDocument | IUser = await User.create({
      username: userInput.data.username,
      password: userInput.data.password,
    });
    res
      .status(StatusCode.Success)
      .json({ message: "signup successfull", user });
    return;
  } catch (err: any) {
    res
      .status(StatusCode.ServerError)
      .json({ message: err.message || "Something went wrong from ourside" });
  }
};
