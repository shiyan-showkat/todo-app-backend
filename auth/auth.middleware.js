import jwt from "jsonwebtoken";

const middleware = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken; // ✅ SAME NAME

    if (!token) {
      return res.status(401).json({ message: "token not found" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "invalid token" });
  }
};

export default middleware;
