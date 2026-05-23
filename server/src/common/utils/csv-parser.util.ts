import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

export function parseCsvFile(
  filePath: string,
): Promise<Array<{ data: Record<string, string>; lineNumber: number }>> {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      reject(new Error(`CSV file not found: ${absolutePath}`));
      return;
    }

    const results: Array<{
      data: Record<string, string>;
      lineNumber: number;
    }> = [];
    let lineNumber = 1; 

    fs.createReadStream(absolutePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }: { header: string }) =>
            header.trim().toLowerCase(),
        }),
      )
      .on('data', (data: Record<string, string>) => {
        lineNumber++;
        results.push({ data, lineNumber });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
}
