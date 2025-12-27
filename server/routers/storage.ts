import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { storagePut } from "../storage";

export const storageRouter = router({
  // Upload file to S3
  uploadFile: protectedProcedure
    .input(z.object({
      filename: z.string(),
      content: z.string(), // base64 encoded
      contentType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Extract base64 data
      const base64Data = input.content.split(',')[1] || input.content;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `uploads/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.filename}`;
      
      // Upload to S3
      const result = await storagePut(fileKey, buffer, input.contentType);
      
      return {
        url: result.url,
        key: result.key,
      };
    }),
});
