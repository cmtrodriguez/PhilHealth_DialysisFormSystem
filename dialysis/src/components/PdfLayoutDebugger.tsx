import { useEffect, useRef, useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react';
import type { PDDRegistration } from '../types';
import {
  createPddRegistrationPdfUrl,
  DEFAULT_PDD_BOX_MAP,
  DEFAULT_PDD_CALIBRATION,
  DEFAULT_PDD_FIELD_MAP,
  downloadPddRegistrationPdf,
  type PdfDigitBox,
  type PdfFieldBox,
  type PdfFieldName,
  type PddBoxFieldName,
  type PddBoxMap,
  type PddCalibration,
  type PddFieldMap,
} from '../utils/exportPddPdf';

interface PdfLayoutDebuggerProps {
  registration: PDDRegistration;
  onClose: () => void;
}

const FIELD_STORAGE_KEY = 'pdd_pdf_field_map_v1';
const BOX_STORAGE_KEY = 'pdd_pdf_box_map_v1';
const CALIBRATION_STORAGE_KEY = 'pdd_pdf_calibration_v1';

function cloneDefaultFields(): PddFieldMap {
  const cloned = {} as PddFieldMap;

  Object.entries(DEFAULT_PDD_FIELD_MAP).forEach(([key, value]) => {
    cloned[key as PdfFieldName] = { ...value };
  });

  return cloned;
}

function cloneDefaultBoxes(): PddBoxMap {
  const cloned = {} as PddBoxMap;

  Object.entries(DEFAULT_PDD_BOX_MAP).forEach(([key, value]) => {
    cloned[key as PddBoxFieldName] = value.map((box) => ({ ...box }));
  });

  return cloned;
}

function loadFields(): PddFieldMap {
  try {
    const saved = localStorage.getItem(FIELD_STORAGE_KEY);

    if (!saved) {
      return cloneDefaultFields();
    }

    const parsed = JSON.parse(saved) as Partial<PddFieldMap>;
    const merged = cloneDefaultFields();

    Object.entries(parsed).forEach(([key, value]) => {
      const fieldKey = key as PdfFieldName;

      if (merged[fieldKey] && value) {
        merged[fieldKey] = {
          ...merged[fieldKey],
          ...value,
        };
      }
    });

    return merged;
  } catch {
    return cloneDefaultFields();
  }
}

function loadBoxes(): PddBoxMap {
  try {
    const saved = localStorage.getItem(BOX_STORAGE_KEY);

    if (!saved) {
      return cloneDefaultBoxes();
    }

    const parsed = JSON.parse(saved) as Partial<PddBoxMap>;
    const merged = cloneDefaultBoxes();

    Object.entries(parsed).forEach(([key, value]) => {
      const boxKey = key as PddBoxFieldName;

      if (merged[boxKey] && value) {
        merged[boxKey] = value.map((box, index) => ({
          ...merged[boxKey][index],
          ...box,
        }));
      }
    });

    return merged;
  } catch {
    return cloneDefaultBoxes();
  }
}

function loadCalibration(): PddCalibration {
  try {
    const saved = localStorage.getItem(CALIBRATION_STORAGE_KEY);

    if (!saved) {
      return { ...DEFAULT_PDD_CALIBRATION };
    }

    return {
      ...DEFAULT_PDD_CALIBRATION,
      ...JSON.parse(saved),
    };
  } catch {
    return { ...DEFAULT_PDD_CALIBRATION };
  }
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRequiredNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function PdfLayoutDebugger({
  registration,
  onClose,
}: PdfLayoutDebuggerProps) {
  const [fields, setFields] = useState<PddFieldMap>(() => loadFields());
  const [boxes, setBoxes] = useState<PddBoxMap>(() => loadBoxes());
  const [calibration, setCalibration] = useState<PddCalibration>(() =>
    loadCalibration(),
  );

  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedField, setSelectedField] =
    useState<PdfFieldName>('lastName');

  const [selectedBoxGroup, setSelectedBoxGroup] =
    useState<PddBoxFieldName>('pin');

  const [selectedBoxIndex, setSelectedBoxIndex] = useState(0);

  const lastObjectUrlRef = useRef<string | null>(null);

  const fieldNames = Object.keys(fields) as PdfFieldName[];
  const boxGroupNames = Object.keys(boxes) as PddBoxFieldName[];

  const refreshPreview = async () => {
    setIsLoading(true);

    try {
      const nextUrl = await createPddRegistrationPdfUrl(registration, {
        debug: true,
        fields,
        boxes,
        calibration,
      });

      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }

      lastObjectUrlRef.current = nextUrl;
      setPdfUrl(nextUrl);
    } catch (error) {
      console.error('Failed to generate PDF preview:', error);
      alert('Failed to generate PDF preview. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshPreview();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [fields, boxes, calibration]);

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const updateField = (
    fieldName: PdfFieldName,
    property: keyof PdfFieldBox,
    value: string,
  ) => {
    setFields((previous) => {
      const currentField = previous[fieldName];

      const nextValue =
        property === 'x' || property === 'y'
          ? parseRequiredNumber(value, currentField[property] ?? 0)
          : parseOptionalNumber(value);

      return {
        ...previous,
        [fieldName]: {
          ...currentField,
          [property]: nextValue,
        },
      };
    });
  };

  const updateDigitBox = (
    groupName: PddBoxFieldName,
    index: number,
    property: keyof PdfDigitBox,
    value: string,
  ) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    setBoxes((previous) => ({
      ...previous,
      [groupName]: previous[groupName].map((box, boxIndex) =>
        boxIndex === index
          ? {
              ...box,
              [property]: parsed,
            }
          : box,
      ),
    }));
  };

  const updateCalibration = (
    property: keyof PddCalibration,
    value: string,
  ) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    setCalibration((previous) => ({
      ...previous,
      [property]: parsed,
    }));
  };

  const saveLayout = () => {
    localStorage.setItem(FIELD_STORAGE_KEY, JSON.stringify(fields));
    localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(boxes));
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));

    alert('PDF layout saved in this browser.');
  };

  const resetLayout = () => {
    const confirmed = confirm('Reset all PDF coordinates to default?');

    if (!confirmed) {
      return;
    }

    const defaultFields = cloneDefaultFields();
    const defaultBoxes = cloneDefaultBoxes();
    const defaultCalibration = { ...DEFAULT_PDD_CALIBRATION };

    setFields(defaultFields);
    setBoxes(defaultBoxes);
    setCalibration(defaultCalibration);

    localStorage.removeItem(FIELD_STORAGE_KEY);
    localStorage.removeItem(BOX_STORAGE_KEY);
    localStorage.removeItem(CALIBRATION_STORAGE_KEY);
  };

  const copyCleanCode = async () => {
    const text = `export const DEFAULT_PDD_CALIBRATION: PddCalibration = ${JSON.stringify(
      calibration,
      null,
      2,
    )};

export const DEFAULT_PDD_FIELD_MAP = ${JSON.stringify(
      fields,
      null,
      2,
    )} satisfies Record<string, PdfFieldBox>;

export const DEFAULT_PDD_BOX_MAP: PddBoxMap = ${JSON.stringify(
      boxes,
      null,
      2,
    )};`;

    await navigator.clipboard.writeText(text);
    alert('Clean calibration, field map, and box map copied.');
  };

  const downloadFinalPdf = () => {
    downloadPddRegistrationPdf(registration, {
      debug: false,
      fields,
      boxes,
      calibration,
    });
  };

  const nudgeSelectedField = (dx: number, dy: number) => {
    setFields((previous) => ({
      ...previous,
      [selectedField]: {
        ...previous[selectedField],
        x: previous[selectedField].x + dx,
        y: previous[selectedField].y + dy,
      },
    }));
  };

  const nudgeSelectedBox = (dx: number, dy: number) => {
    setBoxes((previous) => ({
      ...previous,
      [selectedBoxGroup]: previous[selectedBoxGroup].map((box, index) =>
        index === selectedBoxIndex
          ? {
              ...box,
              x: box.x + dx,
              y: box.y + dy,
            }
          : box,
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-sm">
      <div className="h-full w-full p-4">
        <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
          <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                PDF Layout Editor
              </h2>
              <p className="text-xs text-slate-500">
                Edit text coordinates and individual digit boxes while previewing the encoded PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={refreshPreview}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={saveLayout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={copyCleanCode}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                <Copy className="w-4 h-4" />
                Copy Clean Code
              </button>

              <button
                onClick={downloadFinalPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 text-white font-bold hover:bg-emerald-950"
              >
                <Download className="w-4 h-4" />
                Download Final
              </button>

              <button
                onClick={resetLayout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_620px] min-h-0">
            <main className="bg-slate-900 p-4 min-h-0">
              <div className="h-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative">
                {isLoading && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold shadow">
                    Updating preview...
                  </div>
                )}

                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="PDF Layout Preview"
                    className="w-full h-full bg-white"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white">
                    Loading PDF preview...
                  </div>
                )}
              </div>
            </main>

            <aside className="border-l border-slate-200 min-h-0 overflow-y-auto custom-scrollbar">
              <section className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                  Global Calibration
                </h3>

                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(calibration).map(([key, value]) => (
                    <label key={key} className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {key}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(event) =>
                          updateCalibration(
                            key as keyof PddCalibration,
                            event.target.value,
                          )
                        }
                        className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-emerald-500"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                  Normal Text Nudge
                </h3>

                <select
                  value={selectedField}
                  onChange={(event) =>
                    setSelectedField(event.target.value as PdfFieldName)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs mb-3 outline-none"
                >
                  {fieldNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    onClick={() => nudgeSelectedField(0, 1)}
                    className="col-start-2 px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => nudgeSelectedField(-1, 0)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ←
                  </button>

                  <button
                    onClick={() => nudgeSelectedField(0, -1)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => nudgeSelectedField(1, 0)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    →
                  </button>
                </div>
              </section>

              <section className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                  Digit Box Nudge
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select
                    value={selectedBoxGroup}
                    onChange={(event) => {
                      const nextGroup = event.target.value as PddBoxFieldName;
                      setSelectedBoxGroup(nextGroup);
                      setSelectedBoxIndex(0);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  >
                    {boxGroupNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedBoxIndex}
                    onChange={(event) =>
                      setSelectedBoxIndex(Number(event.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none"
                  >
                    {boxes[selectedBoxGroup].map((_, index) => (
                      <option key={index} value={index}>
                        Digit {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    onClick={() => nudgeSelectedBox(0, 1)}
                    className="col-start-2 px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => nudgeSelectedBox(-1, 0)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ←
                  </button>

                  <button
                    onClick={() => nudgeSelectedBox(0, -1)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => nudgeSelectedBox(1, 0)}
                    className="px-3 py-2 rounded-lg bg-white border hover:bg-slate-100"
                  >
                    →
                  </button>
                </div>
              </section>

              <section className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">
                  Normal Field Coordinates
                </h3>

                <div className="h-[320px] overflow-auto rounded-2xl border border-slate-200">
                  <div className="min-w-[760px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Field
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            X
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Y
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Width
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Height
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {fieldNames.map((fieldName) => {
                          const field = fields[fieldName];

                          return (
                            <tr
                              key={fieldName}
                              className={
                                selectedField === fieldName
                                  ? 'bg-emerald-50'
                                  : 'hover:bg-slate-50'
                              }
                              onClick={() => setSelectedField(fieldName)}
                            >
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedField(fieldName)}
                                  className="font-mono text-xs font-bold text-slate-700 hover:text-emerald-700"
                                >
                                  {fieldName}
                                </button>
                              </td>

                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={field.x}
                                  onChange={(event) =>
                                    updateField(
                                      fieldName,
                                      'x',
                                      event.target.value,
                                    )
                                  }
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={field.y}
                                  onChange={(event) =>
                                    updateField(
                                      fieldName,
                                      'y',
                                      event.target.value,
                                    )
                                  }
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={field.width ?? ''}
                                  onChange={(event) =>
                                    updateField(
                                      fieldName,
                                      'width',
                                      event.target.value,
                                    )
                                  }
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                />
                              </td>

                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={field.height ?? ''}
                                  onChange={(event) =>
                                    updateField(
                                      fieldName,
                                      'height',
                                      event.target.value,
                                    )
                                  }
                                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="p-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">
                  Boxed Digit Coordinates
                </h3>

                <p className="text-xs text-slate-500 mb-3">
                  Use this for PIN and dates. Each digit has its own editable box.
                </p>

                <div className="h-[420px] overflow-auto rounded-2xl border border-slate-200">
                  <div className="min-w-[860px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Group
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Digit
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            X
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Y
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Width
                          </th>
                          <th className="px-3 py-3 text-[10px] font-black text-slate-500 uppercase">
                            Height
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {boxGroupNames.map((groupName) =>
                          boxes[groupName].map((box, index) => {
                            const isSelected =
                              selectedBoxGroup === groupName &&
                              selectedBoxIndex === index;

                            return (
                              <tr
                                key={`${groupName}-${index}`}
                                className={
                                  isSelected
                                    ? 'bg-blue-50'
                                    : 'hover:bg-slate-50'
                                }
                                onClick={() => {
                                  setSelectedBoxGroup(groupName);
                                  setSelectedBoxIndex(index);
                                }}
                              >
                                <td className="px-3 py-2 font-mono text-xs font-bold text-slate-700">
                                  {groupName}
                                </td>

                                <td className="px-3 py-2 font-mono text-xs text-slate-500">
                                  {index + 1}
                                </td>

                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={box.x}
                                    onChange={(event) =>
                                      updateDigitBox(
                                        groupName,
                                        index,
                                        'x',
                                        event.target.value,
                                      )
                                    }
                                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                  />
                                </td>

                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={box.y}
                                    onChange={(event) =>
                                      updateDigitBox(
                                        groupName,
                                        index,
                                        'y',
                                        event.target.value,
                                      )
                                    }
                                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                  />
                                </td>

                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={box.width}
                                    onChange={(event) =>
                                      updateDigitBox(
                                        groupName,
                                        index,
                                        'width',
                                        event.target.value,
                                      )
                                    }
                                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                  />
                                </td>

                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={box.height}
                                    onChange={(event) =>
                                      updateDigitBox(
                                        groupName,
                                        index,
                                        'height',
                                        event.target.value,
                                      )
                                    }
                                    className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-xs outline-none focus:border-emerald-500"
                                  />
                                </td>
                              </tr>
                            );
                          }),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}