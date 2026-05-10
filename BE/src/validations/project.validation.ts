import z from "zod";

export const createProjectValidation = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
});