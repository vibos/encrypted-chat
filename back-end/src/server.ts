import express from 'express';

async function bootstrap(): Promise<void> {
  const app = express();
  const port = 2024;

  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

void bootstrap().catch((err) => {
  console.error(err);
});
