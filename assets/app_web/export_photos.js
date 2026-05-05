const { createPool } = require('./backend/db');
const fs = require('fs');

const pool = createPool();

async function exportPhotos() {
  try {
    console.log('Exporting venues with photos...');
    
    const result = await pool.query(`
      SELECT id, name, photo_uri, phone, website, address 
      FROM venues 
      WHERE photo_uri IS NOT NULL AND photo_uri != ''
    `);
    
    console.log(`Found ${result.rows.length} venues with photos`);
    
    // SQL formatinda export et
    let sql = '-- Export venues with photos\n\n';
    
    for (const venue of result.rows) {
      const escapedName = venue.name.replace(/'/g, "''");
      const escapedPhotoUri = venue.photo_uri.replace(/'/g, "''");
      const escapedPhone = (venue.phone || '').replace(/'/g, "''");
      const escapedWebsite = (venue.website || '').replace(/'/g, "''");
      const escapedAddress = (venue.address || '').replace(/'/g, "''");
      
      sql += `UPDATE venues SET 
        photo_uri = '${escapedPhotoUri}',
        phone = '${escapedPhone}',
        website = '${escapedWebsite}',
        address = '${escapedAddress}'
      WHERE id = ${venue.id};\n`;
    }
    
    fs.writeFileSync('local_photos.sql', sql);
    console.log('Export completed: local_photos.sql');
    
  } catch (err) {
    console.error('Export error:', err.message);
  } finally {
    await pool.end();
  }
}

exportPhotos();
