import mongoose from "mongoose";

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected ✅");
  } catch (err) {
    console.log("DB Error ❌", err.message);
  }
};

export default connectdb;
