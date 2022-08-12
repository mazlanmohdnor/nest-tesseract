import { Injectable } from '@nestjs/common';

import * as Tesseract from 'tesseract.js';
import { OEM, PSM } from 'tesseract.js';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import waifu2x from 'waifu2x';
import { Bndbox, ObjectBox, XMLResponse } from './XMLFile.model';
import * as path from 'path';
import * as sharp from 'sharp';

export type ImgSharpenType = 'whiteFontBlackBG' | 'blackFontWhiteBG';
const IMG_UPSCALED = path.join(
  process.cwd(),
  'src',
  'assets',
  'img',
  'upscaled',
);
const IMG_SHARPED = path.join(process.cwd(), 'src', 'assets', 'img', 'sharp');

const SCALE_FACTOR = 5;

@Injectable()
export class AppService {
  async upscale(imgDir: string): Promise<string[]> {
    const progress = (current: number, total: number) => {
      console.log(
        `[UPSCALLING] Current Image: ${current} Total Images: ${total}`,
      );
    };

    this.cleanAllDir();

    return waifu2x.upscaleImages(
      imgDir,
      IMG_UPSCALED,
      {
        recursive: false,
        mode: 'noise-scale',
        noise: 3,
        scale: SCALE_FACTOR,
        rename: '',
      },
      progress,
    );
  }

  async sharpenImg(type: ImgSharpenType): Promise<string> {
    const filenames = fs.readdirSync(IMG_UPSCALED);

    for (const file of filenames) {
      if (path.extname(file) !== '.xml') {
        const sharpImg = sharp(`${IMG_UPSCALED}\\${file}`);

        if (type === 'whiteFontBlackBG') {
          sharpImg.negate();
        }

        await sharpImg
          .sharpen({
            sigma: 10,
          })
          .grayscale()
          .normalize()
          .toFile(`${IMG_SHARPED}\\${file}`);

        console.log('Img Sharpen: ', `${file}`);
      }
    }
    return Promise.resolve('Img Sharpen Successfully');
  }

  async process(imgDir: string, folderName: string, type: ImgSharpenType) {
    const upscaleStatus = await this.upscale(imgDir);
    console.log('upscaleStatus', upscaleStatus);
    const imgSharpenStatus = await this.sharpenImg(type);
    console.log('imgSharpenStatus', imgSharpenStatus);

    const filenames = fs.readdirSync(IMG_SHARPED);
    for (const file of filenames) {
      if (path.extname(file) !== '.xml') {
        console.log('Analyzing: ', file);
        const recognizeResult = await this.tesseractProcess(file);
        const xml = await this.constructXML(
          recognizeResult,
          file,
          imgDir,
          folderName,
        );
        const newFilename = path.parse(file).name + '.xml';
        const NEW_PATH = `${imgDir}\\${newFilename}`;
        fs.writeFile(NEW_PATH, xml, (err) => {
          if (err) console.log(err);
          console.log('XML Generated: ', NEW_PATH);
        });
      }
    }
  }

  private async tesseractProcess(file: string) {
    const worker =
      Tesseract.createWorker(/*{ logger: (m) => console.log(m) }*/);
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_ocr_engine_mode: OEM.DEFAULT,
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });
    const recognizeResult: Tesseract.RecognizeResult = await worker.recognize(
      `${IMG_SHARPED}\\${file}`,
    );
    return recognizeResult;
  }

  private constructXML(
    recognizeResult: Tesseract.RecognizeResult,
    file: string,
    imgPath: string,
    folderName,
  ) {
    const xmlParse = new XMLResponse();

    const sizes = recognizeResult.data.hocr
      .split(';')
      .find((x) => x.includes('bbox '))
      .trim()
      .split(' ');
    const pathDir = `${imgPath}\\${file}`;

    xmlParse.annotation.folder.push(folderName);
    xmlParse.annotation.filename.push(file);
    xmlParse.annotation.path.push(pathDir);

    xmlParse.annotation.source[0].database.push('unknown');

    xmlParse.annotation.size[0].width[0] = (Number(sizes[3]) / SCALE_FACTOR)
      .toFixed()
      .toString();
    xmlParse.annotation.size[0].height[0] = (Number(sizes[4]) / SCALE_FACTOR)
      .toFixed()
      .toString();
    xmlParse.annotation.size[0].depth[0] = '3';

    xmlParse.annotation.segmented.push('0');

    xmlParse.annotation.object = recognizeResult.data.symbols
      .filter((y) => y.text !== ' ')
      .map((x: Tesseract.Symbol) => {
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
        bndbox.xmin.push((x.bbox.x0 / SCALE_FACTOR).toFixed().toString());
        bndbox.ymin.push((x.bbox.y0 / SCALE_FACTOR).toFixed().toString());
        bndbox.xmax.push((x.bbox.x1 / SCALE_FACTOR).toFixed().toString());
        bndbox.ymax.push((x.bbox.y1 / SCALE_FACTOR).toFixed().toString());

        object.bndbox.push(bndbox);

        return object;
      });

    return new xml2js.Builder().buildObject(xmlParse);
  }

  cleanAllDir() {
    this.cleanDir(IMG_UPSCALED);
    this.cleanDir(IMG_SHARPED);
  }

  async cleanDir(dirPath) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    await fs.mkdirSync(dirPath);
  }
}
