import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title: string;
  html: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

const PREVIEW_FRAME_ID = 'preview-frame';
const PDF_MARGIN_PT = 36;

const waitForRender = async (element: HTMLElement): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  if ('fonts' in document) {
    try {
      await document.fonts.ready;
    } catch (_error) {
      // Continue even if font readiness throws to avoid blocking export.
    }
  }

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          image.addEventListener('load', done, { once: true });
          image.addEventListener('error', done, { once: true });
        })
    )
  );
};

const getTargetElement = (html: string): { element: HTMLElement; cleanup: () => void } => {
  const existingPreview = document.getElementById(PREVIEW_FRAME_ID);
  if (existingPreview instanceof HTMLElement && existingPreview.innerHTML.trim().length > 0) {
    return {
      element: existingPreview,
      cleanup: () => undefined,
    };
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');

  const hiddenWrapper = document.createElement('div');
  hiddenWrapper.style.position = 'fixed';
  hiddenWrapper.style.left = '-10000px';
  hiddenWrapper.style.top = '0';
  hiddenWrapper.style.width = '794px';
  hiddenWrapper.style.backgroundColor = '#ffffff';
  hiddenWrapper.style.padding = '24px';

  const styleTag = document.createElement('style');
  styleTag.textContent = Array.from(parsed.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');

  const previewFrame = document.createElement('div');
  previewFrame.id = PREVIEW_FRAME_ID;
  previewFrame.style.maxWidth = '700px';
  previewFrame.style.margin = '0 auto';
  previewFrame.style.padding = '24px';
  previewFrame.style.background = '#ffffff';
  previewFrame.innerHTML = parsed.body.innerHTML || html;

  hiddenWrapper.appendChild(styleTag);
  hiddenWrapper.appendChild(previewFrame);
  document.body.appendChild(hiddenWrapper);

  return {
    element: previewFrame,
    cleanup: () => {
      document.body.removeChild(hiddenWrapper);
    },
  };
};

const canvasToPdfBlob = (
  canvas: HTMLCanvasElement,
  format: 'a4' | 'letter',
  orientation: 'portrait' | 'landscape'
): Blob => {
  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PDF_MARGIN_PT * 2;
  const contentHeight = pageHeight - PDF_MARGIN_PT * 2;
  const pxPerPt = canvas.width / contentWidth;
  const pageHeightPx = Math.floor(contentHeight * pxPerPt);

  let sourceY = 0;
  let pageIndex = 0;

  while (sourceY < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - sourceY);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;

    const sliceContext = sliceCanvas.getContext('2d');
    if (!sliceContext) {
      throw new Error('Failed to create PDF canvas context.');
    }

    sliceContext.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const imageData = sliceCanvas.toDataURL('image/png');
    const imageHeightPt = sliceHeightPx / pxPerPt;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(imageData, 'PNG', PDF_MARGIN_PT, PDF_MARGIN_PT, contentWidth, imageHeightPt);
    sourceY += sliceHeightPx;
    pageIndex += 1;
  }

  return pdf.output('blob');
};

export const generatePDFFromHTML = async (
  options: PDFExportOptions
): Promise<Blob> => {
  const { html, format = 'a4', orientation = 'portrait' } = options;

  const { element, cleanup } = getTargetElement(html);

  try {
    await waitForRender(element);

    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: Math.min(window.devicePixelRatio || 1, 2),
      windowWidth: Math.max(element.scrollWidth, element.clientWidth),
      windowHeight: Math.max(element.scrollHeight, element.clientHeight),
      width: Math.max(element.scrollWidth, element.clientWidth),
      height: Math.max(element.scrollHeight, element.clientHeight),
    });

    return canvasToPdfBlob(canvas, format, orientation);
  } finally {
    cleanup();
  }
};

export const downloadPDF = async (
  options: PDFExportOptions,
  filename: string
): Promise<void> => {
  const blob = await generatePDFFromHTML(options);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
