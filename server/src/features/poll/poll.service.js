import mongoose from "mongoose";
import { Vote } from "../models/Vote.js";
import { Poll } from "./poll.model.js";

/**
 * Delete a poll and its associated votes atomically
 */
export async function deletePollWithVotes(pollId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Delete all votes for this poll
    await Vote.deleteMany({ poll: pollId }, { session });

    // Step 2: Delete the poll itself
    await Poll.deleteOne({ _id: pollId }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Poll and votes deleted" };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
