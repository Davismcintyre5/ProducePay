function success(data, meta = undefined) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return body;
}

function paginated(items, { page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    success: true,
    data: items,
    meta: { page, limit, total, totalPages }
  };
}

export default { success, paginated };