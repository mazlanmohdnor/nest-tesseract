import { Injectable } from '@nestjs/common';

import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import waifu2x from 'waifu2x';
import { Bndbox, ObjectBox, XMLResponse } from './ResponseInterface';
import * as path from 'path';
import sharp from 'sharp';
const IMG_BASE = path.join(process.cwd(), 'dist', 'assets', 'img');
const IMG_UPSCALED = path.join(
  process.cwd(),
  'src',
  'assets',
  'img',
  'upscaled',
);
const IMG_SHARPED = path.join(process.cwd(), 'src', 'assets', 'img', 'sharp');
const TEMPLATE_URL = path.join(process.cwd(), 'src', 'template.xml');

@Injectable()
export class AppService {
  async upscale() {
    const progress = (current: number, total: number) => {
      console.log(`Current Image: ${current} Total Images: ${total}`);
    };

    await waifu2x.upscaleImages(
      IMG_BASE,
      IMG_UPSCALED,
      {
        recursive: false,
        mode: 'noise-scale',
        noise: 3,
        scale: 4,
      },
      progress,
    );
  }

  async sharpenImg() {
    const filenames = fs.readdirSync(IMG_SHARPED);

    for (const file of filenames) {
      await sharp(`${IMG_UPSCALED}\\${file}`)
        .sharpen({ sigma: 2 })
        // .normalize()
        // .threshold()
        .grayscale()
        .toFile(`${IMG_SHARPED}\\${file}`)
        .then((sharpRes) => console.log(''));
    }
  }

  async process() {
    const filenames = fs.readdirSync(IMG_UPSCALED);

    for (const file of filenames) {
      if (path.extname(file) !== '.xml') {
        console.log(file);

        const recognizeResult: Tesseract.RecognizeResult =
          await Tesseract.recognize(`${IMG_UPSCALED}\\${file}`);
        fs.readFile(TEMPLATE_URL, 'utf-8', (err, buf) => {
          const parser = new xml2js.Parser();
          const builder = new xml2js.Builder();

          parser.parseString(buf, (err, result) => {
            const xmlParse: XMLResponse = result;

            const sizes = recognizeResult.data.hocr
              .split(';')
              .find((x) => x.includes('bbox '))
              .trim()
              .split(' ');
            const pathDir = `${IMG_UPSCALED}\\${file}`;
            xmlParse.annotation.filename.push(file);
            xmlParse.annotation.path.push(pathDir);
            xmlParse.annotation.size[0].width[0] = sizes[3].toString();
            xmlParse.annotation.size[0].height[0] = sizes[4].toString();
            xmlParse.annotation.size[0].depth[0] = '3';

            xmlParse.annotation.object = recognizeResult.data.symbols.map(
              (x: Tesseract.Symbol) => {
                const object: ObjectBox = {
                  name: [],
                  pose: [],
                  truncated: [],
                  difficult: [],
                  bndbox: [],
                };
                object.name.push(x.text);
                object.pose.push('Unspecified');
                object.truncated.push('0');
                object.difficult.push('0');

                const bndbox: Bndbox = {
                  xmin: [],
                  ymin: [],
                  xmax: [],
                  ymax: [],
                };
                bndbox.xmin.push(x.bbox.x0.toString());
                bndbox.ymin.push(x.bbox.y0.toString());
                bndbox.xmax.push(x.bbox.x1.toString());
                bndbox.ymax.push(x.bbox.y1.toString());

                object.bndbox.push(bndbox);

                return object;
              },
            );

            const xml = builder.buildObject(xmlParse);
            const newFilename = path.parse(file).name + '.xml';
            fs.writeFile(`${IMG_UPSCALED}\\${newFilename}`, xml, (err) => {
              if (err) console.log(err);
              console.log('Successfully Written to File.');
            });
          });
        });
      }
    }
  }

  cleanDir(path) {
    fs.rmSync(path, { recursive: true, force: true });
  }
}
