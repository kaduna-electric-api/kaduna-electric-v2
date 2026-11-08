require('dotenv').config();
const mongoose = require('mongoose');
const ApprovedMeter = require('../src/models/ApprovedMeter');
const testMeterNumbers = require('../src/data/testMeterNumbers');

const isTestDatabase = (databaseName) => /(^|[-_])(dev|development|test|testing)([-_]|$)/i.test(databaseName);

const seedTestMeters = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed test meters in production.');
  }
  if (process.env.ALLOW_TEST_METER_SEED !== 'true') {
    throw new Error('Set ALLOW_TEST_METER_SEED=true to explicitly enable this operation.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  if (
    !isTestDatabase(mongoose.connection.name)
    && process.env.ALLOW_TEST_METER_SEED_DATABASE !== mongoose.connection.name
  ) {
    throw new Error(
      'Refusing to seed: use a database named for development/testing, or explicitly set ALLOW_TEST_METER_SEED_DATABASE to the exact connected database name.'
    );
  }

  const operations = testMeterNumbers.map((meterNumber) => ({
    updateOne: {
      filter: { meterNumber },
      update: {
        $setOnInsert: {
          meterNumber,
          meterType: 'prepaid',
          address: 'Synthetic test record - not a real meter',
          source: 'local-test-fixture',
          isActive: true
        }
      },
      upsert: true
    }
  }));
  const result = await ApprovedMeter.bulkWrite(operations, { ordered: false });

  console.log(`Added ${result.upsertedCount} synthetic test meters; ${testMeterNumbers.length - result.upsertedCount} already existed.`);
};

seedTestMeters()
  .catch((error) => {
    console.error(`Test meter seeding failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
