import mongoose from 'mongoose';

const planetSchema = new mongoose.Schema({
  keplerName: { type: String, required: true },
});

const planetModel = mongoose.model('Planet', planetSchema);
export default planetModel;
