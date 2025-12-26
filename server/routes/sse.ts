import { Router } from "express";
import { SSEConnection } from "../_core/notifications";
import { sdk } from "../_core/sdk";

const router = Router();

// SSE endpoint for real-time notifications
router.get("/notifications", async (req, res) => {
  try {
    // Get token from query parameter or header
    const token = req.query.token as string || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = user.id;
    const isAdmin = user.role === "admin";

    // Create SSE connection
    new SSEConnection(res, userId, isAdmin);

    // Note: The response is kept open by SSEConnection
    // It will be closed when the client disconnects
  } catch (error) {
    console.error("SSE connection error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
