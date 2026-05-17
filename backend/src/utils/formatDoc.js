/** Format MongoDB documents for API responses (MySQL-compatible field names) */

const toId = (id) => (id ? String(id) : null);

function formatUser(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: toId(o._id),
    user_id: toId(o._id),
    username: o.username,
    email: o.email,
    fullName: o.full_name,
    full_name: o.full_name,
    role: o.role,
    createdAt: o.createdAt,
    created_at: o.createdAt,
  };
}

function formatCategory(doc, productCount = 0) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    category_id: toId(o._id),
    category_name: o.category_name,
    description: o.description,
    product_count: productCount,
    created_at: o.createdAt,
  };
}

function formatSupplier(doc, productCount = 0) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    supplier_id: toId(o._id),
    supplier_name: o.supplier_name,
    contact_email: o.contact_email,
    contact_phone: o.contact_phone,
    address: o.address,
    product_count: productCount,
    created_at: o.createdAt,
  };
}

function formatProduct(doc, category = null, supplier = null) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const price = Number(o.price) || 0;
  const quantity = Number(o.quantity) || 0;
  const cat = category || o.category_id;
  const sup = supplier || o.supplier_id;

  return {
    product_id: toId(o._id),
    product_name: o.product_name,
    category_id: toId(o.category_id?._id || o.category_id),
    category_name: cat?.category_name || null,
    supplier_id: toId(o.supplier_id?._id || o.supplier_id),
    supplier_name: sup?.supplier_name || null,
    price,
    quantity,
    stock_status: o.stock_status,
    image_url: o.image_url,
    date_added: o.createdAt,
    inventory_value: price * quantity,
  };
}

function formatActivity(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    log_id: toId(o._id),
    action_type: o.action_type,
    entity_type: o.entity_type,
    entity_id: o.entity_id,
    description: o.description,
    created_at: o.createdAt,
    username: o.user_id?.username || null,
  };
}

module.exports = { formatUser, formatCategory, formatSupplier, formatProduct, formatActivity };
