import mongoose from "mongoose";
import { collectionName } from "../utils/config";

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface BookingData {
  id: string;
  walker: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  pet: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  durationMinutes: number;
  pickupAddress: string;
  notes?: string;
  totalPrice: number;
  status: BookingStatus;
}

const bookingSchema = new mongoose.Schema<BookingData>(
  {
    walker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Walker",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 30,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: {
      id?: string;
      _id?: mongoose.Types.ObjectId;
      __v?: number;
    }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Booking = mongoose.model<BookingData>("Booking", bookingSchema, collectionName("bookings"));

export default Booking;
