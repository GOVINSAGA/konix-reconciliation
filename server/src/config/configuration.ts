export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/konix-reconciliation',
  },
  defaultTolerances: {
    timestampToleranceSec: parseInt(
      process.env.TIMESTAMP_TOLERANCE_SECONDS || '300',
      10,
    ),
    quantityTolerancePct: parseFloat(
      process.env.QUANTITY_TOLERANCE_PCT || '0.01',
    ),
  },
});
