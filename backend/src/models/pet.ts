import mongoose from "mongoose";

export type PetSize = "small" | "medium" | "large";

export interface PetData {
  id: string;
  owner: mongoose.Types.ObjectId;
  name: string;
  breed: string;
  size: PetSize;
  notes?: string;
}

const petSchema = new mongoose.Schema<PetData>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    breed: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
      enum: ["small", "medium", "large"],
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

petSchema.set("toJSON", {
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

const Pet = mongoose.model<PetData>("Pet", petSchema);

export default Pet;
