require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri, { dbName: new URL(uri).pathname.replace('/', '') || undefined });
    console.log('Connected to MongoDB');
    const coll = mongoose.connection.collection('transactions');

    // Attempt to drop legacy index names that reference paystack
    const indexes = await coll.indexes();
    console.log('Existing indexes:', indexes.map(i => i.name));

    const candidates = ['paystackReference_1', 'paystackRef_1', 'paystack_reference_1'];
    for (const name of candidates) {
      const exists = indexes.find(i => i.name === name);
      if (exists) {
        try {
          await coll.dropIndex(name);
          console.log('Dropped index', name);
        } catch (e) {
          console.warn('Failed to drop', name, e.message);
        }
      }
    }

    // Create partial unique index on paystackRef
    try {
      await coll.createIndex(
        { paystackRef: 1 },
        { unique: true, partialFilterExpression: { paystackRef: { $type: 'string' } } }
      );
      console.log('Created partial unique index on paystackRef');
    } catch (e) {
      console.error('Failed to create index:', e.message);
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (e) {
    console.error('Error', e.message);
    process.exit(1);
  }
})();