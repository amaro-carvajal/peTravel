import mongoose from "mongoose";

export type WalkerDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface WalkerData {
  id: string;
  user?: mongoose.Types.ObjectId;
  name: string;
  photo?: string;
  description: string;
  coverageAreas: string[];
  hourlyRate: number;
  rating: number;
  availability: {
    days: WalkerDay[];
    startTime: string;
    endTime: string;
  }[];
  phone: string;
  email: string;
}

const availabilitySchema = new mongoose.Schema<WalkerData["availability"][number]>(
  {
    days: {
      type: [String],
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):(00|30)$/, "Selecciona una hora cada 30 minutos"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):(00|30)$/, "Selecciona una hora cada 30 minutos"],
    },
  },
  { _id: false }
);

availabilitySchema.path("days").validate((days: WalkerDay[]) => days.length > 0, "Selecciona al menos un día");
availabilitySchema.path("endTime").validate(function (this: WalkerData["availability"][number], endTime: string) {
  return this.startTime < endTime;
}, "El inicio del bloque debe ser anterior al fin");

const walkerSchema = new mongoose.Schema<WalkerData>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      maxlength: 300,
    },
    coverageAreas: {
      type: [String],
      required: true,
      validate: (areas: string[]) => areas.length > 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    availability: {
      type: [availabilitySchema],
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
  { timestamps: true }
);

walkerSchema.set("toJSON", {
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

const Walker = mongoose.model<WalkerData>("Walker", walkerSchema);

export default Walker;
