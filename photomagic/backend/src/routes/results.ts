import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Must match fileService temp directory
const TEMP_DIR = path.join(process.cwd(), 'temp');

router.get('/:resultId', async (req, res, next) => {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      return res.status(400).send('Missing resultId');
    }

    const files = await fs.readdir(TEMP_DIR);
    const file = files.find(f => f.startsWith(resultId + '.'));

    if (!file) {
      return res.status(404).send('Not Found');
    }

    const filePath = path.join(TEMP_DIR, file);
    const ext = path.extname(file).toLowerCase();
    const mime =
      ext === '.png' ? 'image/png' :
      (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' :
      'application/octet-stream';

    const buf = await fs.readFile(filePath);

    res.setHeader('Content-Type', mime);
    // Force download
    res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
    // Avoid caching stale temp URLs
    res.setHeader('Cache-Control', 'no-store');

    res.send(buf);
  } catch (e) {
    next(e);
  }
});

export default router;
