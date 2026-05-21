import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDDRegistration } from '../types';
import pddTemplateUrl from '../assets/PhilHealth-Patient-Dialysis-Database-Registration-Form.pdf?url';

type ExportablePDDRegistration = PDDRegistration & {
  signaturePreview?: string;
  signatureFileName?: string;
  signatureDate?: string;
  signatureName?: string;
};

export type PdfFieldBox = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type PdfDigitBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PddCalibration = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  fontScale: number;
};

export type PddPdfOptions = {
  debug?: boolean;
  fields?: Partial<PddFieldMap>;
  boxes?: Partial<PddBoxMap>;
  calibration?: Partial<PddCalibration>;
};

const PDF_REFERENCE_WIDTH = 612;
const PDF_REFERENCE_HEIGHT = 792;

export const DEFAULT_PDD_CALIBRATION: PddCalibration = {
  "offsetX": 0,
  "offsetY": 0,
  "scaleX": 1,
  "scaleY": 1,
  "fontScale": 1
};

export const DEFAULT_PDD_FIELD_MAP = {
  "regTypeNew": {
    "x": 426,
    "y": 621
  },
  "regTypeReactivate": {
    "x": 513,
    "y": 619
  },
  "lastName": {
    "x": 147,
    "y": 547
  },
  "firstName": {
    "x": 205,
    "y": 547
  },
  "extension": {
    "x": 284,
    "y": 547
  },
  "middleName": {
    "x": 365,
    "y": 547
  },
  "principalMember": {
    "x": 132,
    "y": 516
  },
  "dependent": {
    "x": 229,
    "y": 514
  },
  "male": {
    "x": 272,
    "y": 485
  },
  "female": {
    "x": 312,
    "y": 485
  },
  "civilStatus": {
    "x": 430,
    "y": 491
  },
  "addressUnit": {
    "x": 48,
    "y": 451
  },
  "addressBuilding": {
    "x": 105,
    "y": 451
  },
  "addressLot": {
    "x": 170,
    "y": 451
  },
  "addressStreet": {
    "x": 240,
    "y": 451
  },
  "addressSubdivision": {
    "x": 320,
    "y": 451
  },
  "addressBarangay": {
    "x": 48,
    "y": 429
  },
  "addressCity": {
    "x": 125,
    "y": 429
  },
  "addressProvince": {
    "x": 205,
    "y": 429
  },
  "addressCountry": {
    "x": 285,
    "y": 429
  },
  "addressZip": {
    "x": 370,
    "y": 429
  },
  "email": {
    "x": 107,
    "y": 397
  },
  "mobile": {
    "x": 308,
    "y": 397
  },
  "landline": {
    "x": 469,
    "y": 397
  },
  "zPdYes": {
    "x": 190,
    "y": 350
  },
  "zPdNo": {
    "x": 233,
    "y": 350
  },
  "zKidneyYes": {
    "x": 190,
    "y": 333
  },
  "zKidneyNo": {
    "x": 233,
    "y": 333
  },
  "previousKidneyYes": {
    "x": 188,
    "y": 290
  },
  "previousKidneyNo": {
    "x": 231,
    "y": 290
  },
  "dialysisStartDate": {
    "x": 136,
    "y": 269
  },
  "hdLowFlux": {
    "x": 222,
    "y": 242
  },
  "hdHighFlux": {
    "x": 278,
    "y": 242
  },
  "hdOthers": {
    "x": 278,
    "y": 242
  },
  "hdOthersText": {
    "x": 380,
    "y": 244
  },
  "pdCapd": {
    "x": 163,
    "y": 216
  },
  "pdCipdC": {
    "x": 209,
    "y": 216
  },
  "pdCipdM": {
    "x": 262,
    "y": 216
  },
  "pdCcpd": {
    "x": 314,
    "y": 217
  },
  "pdNipd": {
    "x": 360,
    "y": 216
  },
  "signatureImage": {
    "x": 200,
    "y": 165,
    "width": 120,
    "height": 24
  },
  "signatureName": {
    "x": 142,
    "y": 170
  },
  "signaturePrintedName": {
    "x": 200,
    "y": 167
  },
  "pddRegistrationNo": {
    "x": 142,
    "y": 110
  },
  "registeredBy": {
    "x": 110,
    "y": 80
  },
  "accreditationNo": {
    "x": 455,
    "y": 80
  }
} satisfies Record<string, PdfFieldBox>;

export type PdfFieldName = keyof typeof DEFAULT_PDD_FIELD_MAP;
export type PddFieldMap = Record<PdfFieldName, PdfFieldBox>;

export type PddBoxFieldName =
  | 'pin'
  | 'dobMonth'
  | 'dobDay'
  | 'dobYear'
  | 'signatureDateMonth'
  | 'signatureDateDay'
  | 'signatureDateYear'
  | 'registrationDateMonth'
  | 'registrationDateDay'
  | 'registrationDateYear';

export type PddBoxMap = Record<PddBoxFieldName, PdfDigitBox[]>;


export const DEFAULT_PDD_BOX_MAP: PddBoxMap = {
  "pin": [
    {
      "x": 204,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 217,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 238,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 252,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 265,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 278,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 292,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 306,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 319,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 333,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 347,
      "y": 569,
      "width": 10,
      "height": 12
    },
    {
      "x": 369,
      "y": 569,
      "width": 10,
      "height": 12
    }
  ],
  "dobMonth": [
    {
      "x": 101,
      "y": 485.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 115,
      "y": 485.5,
      "width": 10,
      "height": 12
    }
  ],
  "dobDay": [
    {
      "x": 136,
      "y": 485.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 150,
      "y": 485.5,
      "width": 10,
      "height": 12
    }
  ],
  "dobYear": [
    {
      "x": 171.5,
      "y": 485.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 185,
      "y": 485.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 198.5,
      "y": 485.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 212,
      "y": 485.5,
      "width": 10,
      "height": 12
    }
  ],
  "signatureDateMonth": [
    {
      "x": 399,
      "y": 163.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 413,
      "y": 163.5,
      "width": 10,
      "height": 12
    }
  ],
  "signatureDateDay": [
    {
      "x": 434,
      "y": 163.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 448,
      "y": 163.5,
      "width": 10,
      "height": 12
    }
  ],
  "signatureDateYear": [
    {
      "x": 470,
      "y": 163.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 483,
      "y": 163.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 497,
      "y": 163.5,
      "width": 10,
      "height": 12
    },
    {
      "x": 510,
      "y": 163.5,
      "width": 10,
      "height": 12
    }
  ],
  "registrationDateMonth": [
    {
      "x": 126,
      "y": 49,
      "width": 10,
      "height": 12
    },
    {
      "x": 140,
      "y": 49,
      "width": 10,
      "height": 12
    }
  ],
  "registrationDateDay": [
    {
      "x": 161,
      "y": 49,
      "width": 10,
      "height": 12
    },
    {
      "x": 175,
      "y": 49,
      "width": 10,
      "height": 12
    }
  ],
  "registrationDateYear": [
    {
      "x": 197,
      "y": 49,
      "width": 10,
      "height": 12
    },
    {
      "x": 210,
      "y": 49,
      "width": 10,
      "height": 12
    },
    {
      "x": 224,
      "y": 49,
      "width": 10,
      "height": 12
    },
    {
      "x": 237,
      "y": 49,
      "width": 10,
      "height": 12
    }
  ]
};

const FONT_SIZE = {
  normal: 7,
  small: 6.2,
  check: 9,
  debug: 5,
};

function safeText(value: unknown): string {
  return String(value ?? '').trim();
}

function upper(value: unknown): string {
  return safeText(value).toUpperCase();
}

function splitDate(dateValue?: string) {
  if (!dateValue) return { month: '', day: '', year: '' };

  const isoDateOnly = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDateOnly) {
    return {
      month: isoDateOnly[2],
      day: isoDateOnly[3],
      year: isoDateOnly[1],
    };
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return { month: '', day: '', year: '' };
  }

  return {
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

function formatMonthYear(value?: string) {
  if (!value) return '';

  const [year, month] = value.split('-');
  if (!year || !month) return value;

  return `${month}/${year}`;
}

function formatFullSignatureName(reg: ExportablePDDRegistration) {
  const lastName = safeText(reg.patientName?.last);
  const firstName = safeText(reg.patientName?.first);
  const middleName = safeText(reg.patientName?.middle);
  const extension = safeText(reg.patientName?.extension);

  const middleInitial = middleName ? `${middleName.charAt(0).toUpperCase()}.` : '';
  const nameParts = [
    lastName ? `${lastName},` : '',
    firstName,
    middleInitial,
    extension,
  ].filter(Boolean);

  return nameParts.join(' ');
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function makeBlob(bytes: Uint8Array) {
  return new Blob([toArrayBuffer(bytes)], {
    type: 'application/pdf',
  });
}

function downloadBlob(bytes: Uint8Array, fileName: string) {
  const blob = makeBlob(bytes);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  URL.revokeObjectURL(url);
}

function mergeFields(fields?: Partial<PddFieldMap>): PddFieldMap {
  const merged = {} as PddFieldMap;

  Object.entries(DEFAULT_PDD_FIELD_MAP).forEach(([key, value]) => {
    const fieldKey = key as PdfFieldName;

    merged[fieldKey] = {
      ...value,
      ...(fields?.[fieldKey] ?? {}),
    };
  });

  return merged;
}

function mergeBoxes(boxes?: Partial<PddBoxMap>): PddBoxMap {
  const merged = {} as PddBoxMap;

  Object.entries(DEFAULT_PDD_BOX_MAP).forEach(([key, value]) => {
    const boxKey = key as PddBoxFieldName;

    merged[boxKey] = boxes?.[boxKey]
      ? boxes[boxKey]!.map((box, index) => ({
          ...value[index],
          ...box,
        }))
      : value.map((box) => ({ ...box }));
  });

  return merged;
}

function cleanBoxValue(value: unknown): string {
  return safeText(value).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function makeGeneratedSignatureDataUrl(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName || typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 240;

  const context = canvas.getContext('2d');

  if (!context) {
    return '';
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000000';
  context.textAlign = 'left';
  context.textBaseline = 'middle';

  let fontSize = 104;

  do {
    context.font = `${fontSize}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive`;
    fontSize -= 4;
  } while (
    context.measureText(trimmedName).width > canvas.width - 80 &&
    fontSize > 52
  );

  context.fillText(trimmedName, 30, canvas.height / 2 + 10);

  return canvas.toDataURL('image/png');
}

async function embedSignatureImage(pdfDoc: PDFDocument, source: string) {
  const imageBytes = await fetch(source).then((res) => res.arrayBuffer());

  try {
    return await pdfDoc.embedPng(imageBytes);
  } catch {
    return await pdfDoc.embedJpg(imageBytes);
  }
}

export async function buildPddRegistrationPdfBytes(
  reg: ExportablePDDRegistration,
  options: PddPdfOptions = {},
) {
  const templateBytes = await fetch(pddTemplateUrl).then((res) =>
    res.arrayBuffer(),
  );

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPage(0);
  const pageSize = page.getSize();

  const autoScaleX = pageSize.width / PDF_REFERENCE_WIDTH;
  const autoScaleY = pageSize.height / PDF_REFERENCE_HEIGHT;

  const fields = mergeFields(options.fields);
  const boxes = mergeBoxes(options.boxes);

  const calibration: PddCalibration = {
    ...DEFAULT_PDD_CALIBRATION,
    ...(options.calibration ?? {}),
  };

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const signatureFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const textColor = rgb(0, 0, 0);
  const debugRed = rgb(1, 0, 0);
  const debugBlue = rgb(0, 0.15, 1);
  const debugGreen = rgb(0, 0.55, 0);

  const transform = (x: number, y: number) => ({
    x: x * autoScaleX * calibration.scaleX + calibration.offsetX,
    y: y * autoScaleY * calibration.scaleY + calibration.offsetY,
  });

  const scaledSize = (size: number) => size * calibration.fontScale;

  const draw = (
    value: unknown,
    x: number,
    y: number,
    size = FONT_SIZE.normal,
    isBold = false,
  ) => {
    const text = safeText(value);
    if (!text) return;

    const point = transform(x, y);

    page.drawText(text, {
      x: point.x,
      y: point.y,
      size: scaledSize(size),
      font: isBold ? boldFont : font,
      color: textColor,
      maxWidth: 250,
    });
  };

  const drawSmall = (value: unknown, x: number, y: number) => {
    draw(value, x, y, FONT_SIZE.small);
  };

  const drawSignature = (value: unknown, x: number, y: number) => {
  const text = safeText(value);
  if (!text) return;

  const point = transform(x, y);

  page.drawText(text, {
    x: point.x,
    y: point.y,
    size: scaledSize(13),
    font: signatureFont,
    color: textColor,
    maxWidth: 160,
  });
};

  const drawBoxedText = (
    value: unknown,
    digitBoxes: PdfDigitBox[],
    size = FONT_SIZE.small,
  ) => {
    const characters = cleanBoxValue(value)
      .slice(0, digitBoxes.length)
      .split('');

    characters.forEach((character, index) => {
      const box = digitBoxes[index];
      if (!box) return;

      const point = transform(box.x, box.y);
      const fontSize = scaledSize(size);
      const characterWidth = font.widthOfTextAtSize(character, fontSize);

      const scaledBoxWidth = box.width * autoScaleX * calibration.scaleX;
      const scaledBoxHeight = box.height * autoScaleY * calibration.scaleY;

      page.drawText(character, {
        x: point.x + (scaledBoxWidth - characterWidth) / 2,
        y: point.y + (scaledBoxHeight - fontSize) / 2,
        size: fontSize,
        font,
        color: textColor,
      });
    });
  };

  const check = (condition: boolean, x: number, y: number) => {
    if (!condition) return;

    const point = transform(x, y);

    page.drawText('X', {
      x: point.x,
      y: point.y,
      size: scaledSize(FONT_SIZE.check),
      font: boldFont,
      color: textColor,
    });
  };

  const drawDebugGrid = () => {
    if (!options.debug) return;

    for (let x = 0; x <= PDF_REFERENCE_WIDTH; x += 25) {
      const start = transform(x, 0);
      const end = transform(x, PDF_REFERENCE_HEIGHT);

      page.drawLine({
        start,
        end,
        thickness: x % 100 === 0 ? 0.6 : 0.25,
        color: x % 100 === 0 ? debugBlue : rgb(0.8, 0.8, 0.8),
        opacity: x % 100 === 0 ? 0.6 : 0.35,
      });

      if (x % 50 === 0) {
        const labelPoint = transform(x + 2, 6);

        page.drawText(String(x), {
          x: labelPoint.x,
          y: labelPoint.y,
          size: FONT_SIZE.debug,
          font,
          color: debugBlue,
        });
      }
    }

    for (let y = 0; y <= PDF_REFERENCE_HEIGHT; y += 25) {
      const start = transform(0, y);
      const end = transform(PDF_REFERENCE_WIDTH, y);

      page.drawLine({
        start,
        end,
        thickness: y % 100 === 0 ? 0.6 : 0.25,
        color: y % 100 === 0 ? debugGreen : rgb(0.8, 0.8, 0.8),
        opacity: y % 100 === 0 ? 0.6 : 0.35,
      });

      if (y % 50 === 0) {
        const labelPoint = transform(5, y + 2);

        page.drawText(String(y), {
          x: labelPoint.x,
          y: labelPoint.y,
          size: FONT_SIZE.debug,
          font,
          color: debugGreen,
        });
      }
    }
  };

  const drawDebugPoint = (label: string, x: number, y: number) => {
    if (!options.debug) return;

    const point = transform(x, y);

    page.drawCircle({
      x: point.x,
      y: point.y,
      size: 2,
      color: debugRed,
      opacity: 0.9,
    });

    page.drawText(`${label} (${x}, ${y})`, {
      x: point.x + 4,
      y: point.y + 4,
      size: FONT_SIZE.debug,
      font,
      color: debugRed,
    });
  };

  const drawDebugBox = (
    label: string,
    box: PdfDigitBox,
    groupIndex: number,
  ) => {
    if (!options.debug) return;

    const point = transform(box.x, box.y);
    const scaledBoxWidth = box.width * autoScaleX * calibration.scaleX;
    const scaledBoxHeight = box.height * autoScaleY * calibration.scaleY;

    page.drawRectangle({
      x: point.x,
      y: point.y,
      width: scaledBoxWidth,
      height: scaledBoxHeight,
      borderColor: debugRed,
      borderWidth: 0.5,
    });

    page.drawText(`${label}[${groupIndex}]`, {
      x: point.x,
      y: point.y + scaledBoxHeight + 2,
      size: FONT_SIZE.debug,
      font,
      color: debugRed,
    });
  };

  const drawAllDebugPoints = () => {
    if (!options.debug) return;

    Object.entries(fields).forEach(([key, value]) => {
      drawDebugPoint(key, value.x, value.y);
    });

    Object.entries(boxes).forEach(([groupName, digitBoxes]) => {
      digitBoxes.forEach((box, index) => {
        drawDebugBox(groupName, box, index);
      });
    });

    const topLabel = transform(20, 770);

    page.drawText(
      `DEBUG MODE | fontScale: ${calibration.fontScale} | offsetX: ${calibration.offsetX} | offsetY: ${calibration.offsetY}`,
      {
        x: topLabel.x,
        y: topLabel.y,
        size: 8,
        font: boldFont,
        color: debugRed,
      },
    );
  };

  drawDebugGrid();

  const dob = splitDate(reg.dob);
  const signatureDate = splitDate(reg.signatureDate || reg.createdAt);
  const registrationDate = splitDate(reg.admin?.registrationDate || reg.createdAt);

  check(
    reg.regType === 'New Registration',
    fields.regTypeNew.x,
    fields.regTypeNew.y,
  );

  check(
    reg.regType === 'Reactivation',
    fields.regTypeReactivate.x,
    fields.regTypeReactivate.y,
  );

  drawBoxedText(reg.pin, boxes.pin);

  draw(upper(reg.patientName?.last), fields.lastName.x, fields.lastName.y);
  draw(upper(reg.patientName?.first), fields.firstName.x, fields.firstName.y);
  draw(upper(reg.patientName?.extension), fields.extension.x, fields.extension.y);
  draw(upper(reg.patientName?.middle), fields.middleName.x, fields.middleName.y);

  check(
    reg.memberType === 'Principal Member',
    fields.principalMember.x,
    fields.principalMember.y,
  );

  check(
    reg.memberType === 'Dependent',
    fields.dependent.x,
    fields.dependent.y,
  );

  drawBoxedText(dob.month, boxes.dobMonth);
  drawBoxedText(dob.day, boxes.dobDay);
  drawBoxedText(dob.year, boxes.dobYear);

  check(reg.sex === 'Male', fields.male.x, fields.male.y);
  check(reg.sex === 'Female', fields.female.x, fields.female.y);

  draw(upper(reg.civilStatus), fields.civilStatus.x, fields.civilStatus.y);

  drawSmall(upper(reg.address?.unit), fields.addressUnit.x, fields.addressUnit.y);
  drawSmall(
    upper(reg.address?.building),
    fields.addressBuilding.x,
    fields.addressBuilding.y,
  );
  drawSmall(upper(reg.address?.lot), fields.addressLot.x, fields.addressLot.y);
  drawSmall(upper(reg.address?.street), fields.addressStreet.x, fields.addressStreet.y);
  drawSmall(
    upper(reg.address?.subdivision),
    fields.addressSubdivision.x,
    fields.addressSubdivision.y,
  );

  drawSmall(
    upper(reg.address?.barangay),
    fields.addressBarangay.x,
    fields.addressBarangay.y,
  );
  drawSmall(upper(reg.address?.city), fields.addressCity.x, fields.addressCity.y);
  drawSmall(
    upper(reg.address?.province),
    fields.addressProvince.x,
    fields.addressProvince.y,
  );
  drawSmall(
    upper(reg.address?.country),
    fields.addressCountry.x,
    fields.addressCountry.y,
  );
  drawSmall(upper(reg.address?.zip), fields.addressZip.x, fields.addressZip.y);

  draw(reg.contact?.email, fields.email.x, fields.email.y);
  draw(reg.contact?.mobile, fields.mobile.x, fields.mobile.y);
  draw(reg.contact?.landline, fields.landline.x, fields.landline.y);

  check(Boolean(reg.zBenefits?.pdFirstPolicy), fields.zPdYes.x, fields.zPdYes.y);
  check(!reg.zBenefits?.pdFirstPolicy, fields.zPdNo.x, fields.zPdNo.y);

  check(
    Boolean(reg.zBenefits?.kidneyTransplant),
    fields.zKidneyYes.x,
    fields.zKidneyYes.y,
  );
  check(!reg.zBenefits?.kidneyTransplant, fields.zKidneyNo.x, fields.zKidneyNo.y);

  check(
    Boolean(reg.previousAvailment?.kidneyTransplant),
    fields.previousKidneyYes.x,
    fields.previousKidneyYes.y,
  );
  check(
    !reg.previousAvailment?.kidneyTransplant,
    fields.previousKidneyNo.x,
    fields.previousKidneyNo.y,
  );

  draw(
    formatMonthYear(reg.dialysisStartDate),
    fields.dialysisStartDate.x,
    fields.dialysisStartDate.y,
  );

  check(reg.hdDetails?.type === 'Low flux', fields.hdLowFlux.x, fields.hdLowFlux.y);
  check(
    reg.hdDetails?.type === 'High flux',
    fields.hdHighFlux.x,
    fields.hdHighFlux.y,
  );
  check(reg.hdDetails?.type === 'Others', fields.hdOthers.x, fields.hdOthers.y);

  if (reg.hdDetails?.type === 'Others') {
    draw(reg.hdDetails?.othersDetail, fields.hdOthersText.x, fields.hdOthersText.y);
  }

  check(reg.pdDetails?.system === 'CAPD', fields.pdCapd.x, fields.pdCapd.y);
  check(reg.pdDetails?.system === 'CIPD-C', fields.pdCipdC.x, fields.pdCipdC.y);
  check(reg.pdDetails?.system === 'CIPD-M', fields.pdCipdM.x, fields.pdCipdM.y);
  check(reg.pdDetails?.system === 'CCPD', fields.pdCcpd.x, fields.pdCcpd.y);
  check(reg.pdDetails?.system === 'NIPD', fields.pdNipd.x, fields.pdNipd.y);

const typedSignatureName = safeText(reg.signatureName);
const fallbackSignatureName = `${safeText(reg.patientName?.first)} ${safeText(
  reg.patientName?.last,
)}`.trim();

const signatureText = typedSignatureName || fallbackSignatureName;

const signatureSource =
  safeText(reg.signaturePreview) || makeGeneratedSignatureDataUrl(signatureText);

if (signatureSource) {
  try {
    const image = await embedSignatureImage(pdfDoc, signatureSource);

    const imagePoint = transform(
      fields.signatureImage.x,
      fields.signatureImage.y,
    );

    page.drawImage(image, {
      x: imagePoint.x,
      y: imagePoint.y,
      width:
        (fields.signatureImage.width ?? 120) *
        autoScaleX *
        calibration.scaleX,
      height:
        (fields.signatureImage.height ?? 24) *
        autoScaleY *
        calibration.scaleY,
    });
  } catch {
    drawSignature(
      signatureText,
      fields.signatureName.x,
      fields.signatureName.y,
    );
  }
} else {
  drawSignature(
    signatureText,
    fields.signatureName.x,
    fields.signatureName.y,
  );
}

const printedSignatureName = formatFullSignatureName(reg);

if (printedSignatureName) {
  draw(
    upper(printedSignatureName),
    fields.signaturePrintedName.x,
    fields.signaturePrintedName.y,
    FONT_SIZE.small,
  );
}

  drawBoxedText(signatureDate.month, boxes.signatureDateMonth);
  drawBoxedText(signatureDate.day, boxes.signatureDateDay);
  drawBoxedText(signatureDate.year, boxes.signatureDateYear);

  draw(
    reg.admin?.pddRegNo === 'AUTO-GEN' ? '' : reg.admin?.pddRegNo,
    fields.pddRegistrationNo.x,
    fields.pddRegistrationNo.y,
  );

  draw(
    reg.admin?.registeredBy?.startsWith('Juan Dela Cruz')
      ? ''
      : reg.admin?.registeredBy,
    fields.registeredBy.x,
    fields.registeredBy.y,
  );

  draw(
    reg.admin?.accreditationNo === 'N/A' ? '' : reg.admin?.accreditationNo,
    fields.accreditationNo.x,
    fields.accreditationNo.y,
  );

  drawBoxedText(registrationDate.month, boxes.registrationDateMonth);
  drawBoxedText(registrationDate.day, boxes.registrationDateDay);
  drawBoxedText(registrationDate.year, boxes.registrationDateYear);

  drawAllDebugPoints();

  return pdfDoc.save();
}

export async function createPddRegistrationPdfUrl(
  reg: ExportablePDDRegistration,
  options: PddPdfOptions = {},
) {
  const bytes = await buildPddRegistrationPdfBytes(reg, options);
  const blob = makeBlob(bytes);
  return URL.createObjectURL(blob);
}

export async function downloadPddRegistrationPdf(
  reg: ExportablePDDRegistration,
  options: PddPdfOptions = {},
) {
  const filledPdfBytes = await buildPddRegistrationPdfBytes(reg, options);

  const patientLastName = upper(reg.patientName?.last) || 'PATIENT';
  const patientFirstName = upper(reg.patientName?.first) || 'FORM';

  downloadBlob(
    filledPdfBytes,
    options.debug
      ? `DEBUG-PhilHealth-Dialysis-Form-${patientLastName}-${patientFirstName}.pdf`
      : `PhilHealth-Dialysis-Form-${patientLastName}-${patientFirstName}.pdf`,
  );
}