export const  parseDescriptionIfNeeded = (req, res, next) => {
  if (typeof req.body.description === 'string') {
    try {
      req.body.description = JSON.parse(req.body.description);
    } catch (err) {
      return res.status(400).json({
        message: "Invalid JSON in 'description' field"
      });
    }
  }
  next();
}