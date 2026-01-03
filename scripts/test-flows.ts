import * as db from "../server/db";
import { calculateCancellation, cancelBooking } from "../server/cancellationPolicy";

async function testCancellationAndReviewFlows() {
  console.log("=== Testing Cancellation and Review Flows ===\n");

  try {
    // 1. Get existing test data
    console.log("1. Fetching test booking data...");
    // Get a test user first
    const testUserId = 1; // Assuming user ID 1 exists
    const bookings = await db.getUserBookings(testUserId);
    
    if (bookings.length === 0) {
      console.log("❌ No bookings found. Please create a test booking first.");
      return;
    }

    const testBooking = bookings[0];
    console.log(`✅ Found booking ID: ${testBooking.id}`);
    console.log(`   Office: ${testBooking.officeId}`);
    console.log(`   User: ${testBooking.userId}`);
    console.log(`   Status: ${testBooking.status}`);
    console.log(`   Date: ${testBooking.bookingDate}\n`);

    // 2. Test cancellation calculation
    console.log("2. Testing cancellation calculation...");
    try {
      const cancellationInfo = await calculateCancellation(
        testBooking.id,
        testBooking.userId
      );
      
      console.log("✅ Cancellation calculation successful:");
      console.log(`   Allowed: ${cancellationInfo.allowed}`);
      console.log(`   Refund Amount: ${cancellationInfo.refundAmount} OMR`);
      console.log(`   Penalty Amount: ${cancellationInfo.penaltyAmount} OMR`);
      console.log(`   Penalty Percent: ${cancellationInfo.penaltyPercent}%`);
      console.log(`   Reason: ${cancellationInfo.reason}\n`);
    } catch (error: any) {
      console.log(`⚠️  Cancellation calculation: ${error.message}\n`);
    }

    // 3. Test review creation
    console.log("3. Testing review creation...");
    try {
      const reviewId = await db.createReview({
        officeId: testBooking.officeId,
        bookingId: testBooking.id,
        userId: testBooking.userId,
        rating: 5,
        reviewText: "Excellent service! Very professional and efficient.",
      });
      
      console.log(`✅ Review created successfully with ID: ${reviewId}`);
      
      // Get office reviews
      const reviews = await db.getOfficeReviews(testBooking.officeId);
      console.log(`✅ Office now has ${reviews.length} review(s)`);
      
      if (reviews.length > 0) {
        const latestReview = reviews[0];
        console.log(`   Latest review: ${latestReview.rating} stars`);
        console.log(`   Comment: ${latestReview.reviewText}\n`);
      }
    } catch (error: any) {
      console.log(`⚠️  Review creation: ${error.message}\n`);
    }

    // 4. Test actual cancellation (if allowed)
    console.log("4. Testing booking cancellation...");
    try {
      const cancelResult = await cancelBooking(
        testBooking.id,
        testBooking.userId,
        "Testing cancellation flow - automated test"
      );
      
      if (cancelResult.success) {
        console.log("✅ Booking cancelled successfully");
        console.log(`   Refund: ${cancelResult.refundAmount} OMR`);
        console.log(`   Penalty: ${cancelResult.penaltyAmount} OMR\n`);
      } else {
        console.log(`⚠️  Cancellation not allowed: ${cancelResult.message}\n`);
      }
    } catch (error: any) {
      console.log(`⚠️  Cancellation: ${error.message}\n`);
    }

    console.log("=== Test Complete ===");
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
  }
}

testCancellationAndReviewFlows()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
