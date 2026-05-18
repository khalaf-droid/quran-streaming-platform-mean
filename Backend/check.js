import mongoose from 'mongoose';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/QuranApp');
  const Surah = mongoose.model('Surah', new mongoose.Schema({}, { strict: false }));
  const surahs = await Surah.find({}).lean();
  console.log('Total Surahs:', surahs.length);
  console.log('Sample Surahs:', surahs.slice(0, 3).map(s => s.surahNumber || s.number || 'no-number'));
  process.exit(0);
}
check();
