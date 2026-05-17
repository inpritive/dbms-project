const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

/** Seed sample inventory data if collections are empty */
async function seedSampleData() {
  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    console.log('✓ Sample data already exists');
    return;
  }

  const categories = await Category.insertMany([
    { category_name: 'Electronics', description: 'Electronic devices and accessories' },
    { category_name: 'Office Supplies', description: 'Stationery and office equipment' },
    { category_name: 'Furniture', description: 'Office and warehouse furniture' },
    { category_name: 'Hardware', description: 'Tools and hardware items' },
    { category_name: 'Software', description: 'Software licenses and subscriptions' },
  ]);

  const suppliers = await Supplier.insertMany([
    { supplier_name: 'TechSupply Co.', contact_email: 'contact@techsupply.com', contact_phone: '+1-555-0101', address: '123 Tech Park, CA' },
    { supplier_name: 'OfficeMart Ltd.', contact_email: 'sales@officemart.com', contact_phone: '+1-555-0102', address: '456 Business Ave, NY' },
    { supplier_name: 'FurniWorld Inc.', contact_email: 'info@furniworld.com', contact_phone: '+1-555-0103', address: '789 Furniture Blvd, IL' },
    { supplier_name: 'HardWare Plus', contact_email: 'orders@hardwareplus.com', contact_phone: '+1-555-0104', address: '321 Industrial Rd, TX' },
    { supplier_name: 'SoftLicense Hub', contact_email: 'support@softlicense.com', contact_phone: '+1-555-0105', address: '654 Cloud Street, WA' },
  ]);

  const [elec, office, furn, hard, soft] = categories;
  const [tech, offmart, furni, hardw, softl] = suppliers;

  await Product.insertMany([
    { product_name: 'Wireless Mouse', category_id: elec._id, supplier_id: tech._id, price: 29.99, quantity: 150 },
    { product_name: 'Mechanical Keyboard', category_id: elec._id, supplier_id: tech._id, price: 89.99, quantity: 75 },
    { product_name: 'USB-C Hub', category_id: elec._id, supplier_id: tech._id, price: 45.0, quantity: 8 },
    { product_name: 'A4 Paper Ream', category_id: office._id, supplier_id: offmart._id, price: 5.99, quantity: 500 },
    { product_name: 'Ballpoint Pen Pack', category_id: office._id, supplier_id: offmart._id, price: 3.49, quantity: 0 },
    { product_name: 'Ergonomic Office Chair', category_id: furn._id, supplier_id: furni._id, price: 299.99, quantity: 25 },
    { product_name: 'Standing Desk', category_id: furn._id, supplier_id: furni._id, price: 449.99, quantity: 5 },
    { product_name: 'LED Monitor 27"', category_id: elec._id, supplier_id: tech._id, price: 349.99, quantity: 40 },
    { product_name: 'Screwdriver Set', category_id: hard._id, supplier_id: hardw._id, price: 24.99, quantity: 120 },
    { product_name: 'Microsoft Office License', category_id: soft._id, supplier_id: softl._id, price: 149.99, quantity: 200 },
    { product_name: 'HDMI Cable 2m', category_id: elec._id, supplier_id: tech._id, price: 12.99, quantity: 3 },
    { product_name: 'Stapler Heavy Duty', category_id: office._id, supplier_id: offmart._id, price: 15.99, quantity: 60 },
  ]);

  await ActivityLog.create({
    action_type: 'CREATE',
    entity_type: 'system',
    description: 'Sample inventory data seeded',
  });

  console.log('✓ Sample products, categories, and suppliers seeded');
}

module.exports = { seedSampleData };
