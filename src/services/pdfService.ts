import jsPDF from 'jspdf';

export interface PDFExportOptions {
  title: string;
  html: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export const generatePDFFromHTML = async (
  options: PDFExportOptions
): Promise<Blob> => {
  const { html, format = 'a4', orientation = 'portrait' } = options;

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');

  const renderContainer = document.createElement('div');
  renderContainer.style.position = 'fixed';
  renderContainer.style.left = '-10000px';
  renderContainer.style.top = '0';
  renderContainer.style.width = '794px';
  renderContainer.style.backgroundColor = '#ffffff';

  const styleTag = document.createElement('style');
  styleTag.textContent = Array.from(parsed.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');

  const bodyContainer = document.createElement('div');
  bodyContainer.innerHTML = parsed.body.innerHTML || html;

  renderContainer.appendChild(styleTag);
  renderContainer.appendChild(bodyContainer);
  document.body.appendChild(renderContainer);

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format,
    });

    await new Promise<void>((resolve, reject) => {
      try {
        pdf.html(renderContainer, {
          margin: [36, 36, 36, 36],
          autoPaging: 'text',
          html2canvas: {
            scale: 1,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          callback: () => resolve(),
        });
      } catch (error) {
        reject(error);
      }
    });

    return pdf.output('blob');
  } finally {
    document.body.removeChild(renderContainer);
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
