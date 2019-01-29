import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  account: { type: 'String', required: true },
  name: { type: 'String', required: true },
  date: { type: 'String', required: true },
  dateISO: { type: 'String', required: false},
  amount: { type: 'Number', required: true },
  category: { type: 'Array', required: true },
  // location: { type: 'Mixed', required: false },
});

export default mongoose.model('transactions', transactionSchema);
