/**
 * Migration script: Update all case files with old /uploads/ URLs
 * This marks old files as unavailable since they don't exist on Cloudinary
 * Run with: node seed/migrate-files-to-cloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Case = require('../models/Case');
const connectDB = require('../config/db');

async function migrateFiles() {
  try {
    await connectDB();
    console.log('🔄 Starting file migration...\n');

    // Find all cases with files that have /uploads/ URLs
    const casesWithOldFiles = await Case.find({
      'files.url': { $regex: '/uploads/' }
    });

    if (casesWithOldFiles.length === 0) {
      console.log('✅ No old /uploads/ URLs found. All files are up to date!');
      await mongoose.connection.close();
      return;
    }

    console.log(`📦 Found ${casesWithOldFiles.length} case(s) with old file URLs\n`);

    let totalFilesUpdated = 0;

    for (const caseDoc of casesWithOldFiles) {
      const oldFilesCount = caseDoc.files.filter(f => f.url.includes('/uploads/')).length;
      
      // Mark old files as unavailable
      caseDoc.files = caseDoc.files.map(file => {
        if (file.url.includes('/uploads/')) {
          return {
            ...file,
            url: '[FILE_UNAVAILABLE]',
            migratedFromLocal: true,
            originalUrl: file.url
          };
        }
        return file;
      });

      await caseDoc.save();
      totalFilesUpdated += oldFilesCount;
      console.log(`✅ Case ${caseDoc.caseNumber}: Updated ${oldFilesCount} file(s)`);
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Total files marked as unavailable: ${totalFilesUpdated}`);
    console.log(`\n⚠️  Note: Old files were stored locally and are no longer accessible.`);
    console.log(`   Users will see [FILE_UNAVAILABLE] for old files.`);
    console.log(`   New uploads will use Cloudinary and persist across deployments.`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateFiles();
