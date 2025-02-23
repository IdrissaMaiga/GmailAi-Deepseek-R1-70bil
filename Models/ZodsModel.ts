import { z } from "zod";

 export const Book = z.object({
  name: z.string(),
  authors: z.array(z.string()),
});