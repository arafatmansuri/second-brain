import z from "zod";

export const siginInputSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters" }),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
export const forgetInputSchema = z.object({
  otp: z.number(),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});
export const signupInputSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .regex(/[A-Z]/, {
      message: "Pasword should include atlist 1 uppercasecharacter",
    })
    .regex(/[a-z]/, {
      message: "Pasword should include atlist 1 lowercasecharacter",
    })
    .regex(/[0-9]/, {
      message: "Pasword should include atlist 1 number character",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Pasword should include atlist 1 special character",
    })
    .min(8, { message: "Password length shouldn't be less than 8" }),
});