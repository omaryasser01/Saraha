export const validation = (schema) => {
  return async (req, res, next) => {
    let errRes = [];
    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      if (error) {
        errRes.push(error.details);
      }
    }
    if (errRes.length > 0) {
      return res
        .status(400)
        .json({ message: "validation error", error: errRes });
    }

    next();
  };
};
