import { NextApiResponse } from 'next';

export default async (_: unknown, res: NextApiResponse): Promise<void> => {
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();

  return null;
};
