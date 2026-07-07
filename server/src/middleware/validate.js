export function validate(schema) {
  return (req, _res, next) => {
    req.validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  };
}
